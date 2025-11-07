import {
    Box,
    Button,
    capitalize,
    CircularProgress,
    Input,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Typography,
    Alert
} from "@mui/material";
import {highlight, languages} from "prismjs";
import {useEffect, useState} from "react";
import Editor from "react-simple-code-editor";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {Save} from "@mui/icons-material";
import {CreateSnippet, CreateSnippetWithLang} from "../../utils/snippet.ts";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {useCreateSnippet, useGetFileTypes} from "../../utils/queries.tsx";
import {queryClient} from "../../App.tsx";
import {useSnackbarContext} from "../../contexts/snackbarContext.tsx";
import {useSnippetsOperations} from "../../utils/queries.tsx";

export const AddSnippetModal = ({open, onClose, defaultSnippet}: {
    open: boolean,
    onClose: () => void,
    defaultSnippet?: CreateSnippetWithLang
}) => {
    const [language, setLanguage] = useState(defaultSnippet?.language ?? "PRINTSCRIPT");
    const [code, setCode] = useState(defaultSnippet?.content ?? "");
    const [snippetName, setSnippetName] = useState(defaultSnippet?.name ?? "")
    const [description, setDescription] = useState("")
    const [version, setVersion] = useState("1.0")
    const [error, setError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const {createSnackbar} = useSnackbarContext();
    const snippetOperations = useSnippetsOperations();

    const {mutateAsync: createSnippet, isLoading: loadingSnippet} = useCreateSnippet({
        onSuccess: () => {
            queryClient.invalidateQueries('listSnippets');
            createSnackbar('success', 'Snippet created successfully');
            onClose();
        }
    })
    const {data: fileTypes} = useGetFileTypes();

    const validateCode = async (content: string): Promise<boolean> => {
        if (!content.trim()) {
            setError("Code cannot be empty");
            return false;
        }

        setIsValidating(true);
        setError(null);

        try {
            const result = await snippetOperations.validateContent(content, language, version);

            if (!result.isValid) {
                const errorMessages = result.violations.map(v =>
                    `Line ${v.line}, Col ${v.column}: ${v.message}`
                ).join('\n');
                setError(`Code does not parse:\n${errorMessages}`);
                createSnackbar('error', 'Code does not parse');
                return false;
            }

            return true;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to validate code';
            setError(errorMessage);
            createSnackbar('error', errorMessage);
            return false;
        } finally {
            setIsValidating(false);
        }
    };

    const handleCreateSnippet = async () => {
        const isValid = await validateCode(code);
        if (!isValid) return;

        setError(null);

        const newSnippet: CreateSnippet = {
            name: snippetName,
            content: code,
            language: language,
            description: description,
            version: version,
            extension: fileTypes?.find((f) => f.language === language)?.extension ?? "prs"
        }

        try {
            await createSnippet(newSnippet);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create snippet';
            setError(errorMessage);
            createSnackbar('error', errorMessage);
        }
    }

    useEffect(() => {
        if (defaultSnippet) {
            setCode(defaultSnippet?.content)
            setLanguage(defaultSnippet?.language)
            setSnippetName(defaultSnippet?.name)
            setDescription(defaultSnippet?.description)
            setVersion(defaultSnippet?.version)
        }
    }, [defaultSnippet]);

    useEffect(() => {
        if (!open) {
            setError(null);
        }
    }, [open]);

    return (
        <ModalWrapper open={open} onClose={onClose}>
            {
                <Box sx={{display: 'flex', flexDirection: "row", justifyContent: "space-between"}}>
                    <Typography id="modal-modal-title" variant="h5" component="h2"
                                sx={{display: 'flex', alignItems: 'center'}}>
                        Add Snippet
                    </Typography>
                    <Button
                        disabled={!snippetName || !code || !language || loadingSnippet || isValidating}
                        variant="contained"
                        disableRipple
                        sx={{boxShadow: 0}}
                        onClick={handleCreateSnippet}
                    >
                        <Box pr={1} display={"flex"} alignItems={"center"} justifyContent={"center"}>
                            {(loadingSnippet || isValidating) ? <CircularProgress size={24}/> : <Save/>}
                        </Box>
                        Save Snippet
                    </Button>
                </Box>
            }

            {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <InputLabel htmlFor="name">Name</InputLabel>
                <Input onChange={e => setSnippetName(e.target.value)} value={snippetName} id="name"
                       sx={{width: '50%'}}/>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <InputLabel htmlFor="description">Description</InputLabel>
                <Input
                    onChange={e => setDescription(e.target.value)}
                    value={description}
                    id="description"
                    sx={{width: '100%'}}
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <InputLabel htmlFor="version">Version</InputLabel>
                <Input
                    onChange={e => setVersion(e.target.value)}
                    value={version}
                    id="version"
                    sx={{width: '50%'}}
                />
            </Box>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <InputLabel htmlFor="name">Language</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={language}
                    label="Age"
                    onChange={(e: SelectChangeEvent<string>) => setLanguage(e.target.value)}
                    sx={{width: '50%'}}
                >
                    {
                        fileTypes?.map(x => (
                            <MenuItem data-testid={`menu-option-${x.language}`} key={x.language}
                                      value={x.language}>{capitalize((x.language))}</MenuItem>
                        ))
                    }
                </Select>
            </Box>
            <InputLabel>Code Snippet</InputLabel>
            <Box width={"100%"} sx={{
                backgroundColor: 'black', color: 'white', borderRadius: "8px",
            }}>
                <Editor
                    value={code}
                    padding={10}
                    data-testid={"add-snippet-code-editor"}
                    onValueChange={(code) => setCode(code)}
                    highlight={(code) => highlight(code, languages.js, 'javascript')}
                    style={{
                        borderRadius: "8px",
                        overflow: "auto",
                        minHeight: "300px",
                        maxHeight: "600px",
                        width: "100%",
                        fontFamily: "monospace",
                        fontSize: 17,
                    }}
                />
            </Box>
        </ModalWrapper>
    )
}