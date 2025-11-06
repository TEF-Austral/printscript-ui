import {useEffect, useRef, useState} from "react";
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {Alert, Box, CircularProgress, IconButton, Tooltip, Typography, Chip} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {
  useUpdateSnippetById
} from "../utils/queries.tsx";
import {useFormatSnippet, useGetSnippetById, useShareSnippet, useAnalyzeSnippet} from "../utils/queries.tsx";
import {Bòx} from "../components/snippet-table/SnippetBox.tsx";
import {BugReport, Delete, Download, Save, Share, Upload, CheckCircle} from "@mui/icons-material";
import {ShareSnippetModal} from "../components/snippet-detail/ShareSnippetModal.tsx";
import {TestSnippetModal} from "../components/snippet-test/TestSnippetModal.tsx";
import {Snippet} from "../utils/snippet.ts";
import {SnippetExecution} from "./SnippetExecution.tsx";
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import {queryClient} from "../App.tsx";
import {DeleteConfirmationModal} from "../components/snippet-detail/DeleteConfirmationModal.tsx";
import {useSnackbarContext} from "../contexts/snackbarContext.tsx";
import { SharePermissions } from "../utils/snippetOperations";

type SnippetDetailProps = {
  id: string;
  handleCloseModal: () => void;
}

const DownloadButton = ({snippet}: { snippet?: Snippet }) => {
  if (!snippet) return null;
  const file = new Blob([snippet.content], {type: 'text/plain'});

  return (
      <Tooltip title={"Download"}>
        <IconButton sx={{
          cursor: "pointer"
        }}>
          <a download={`${snippet.name}.${snippet.extension}`} target="_blank"
             rel="noreferrer" href={URL.createObjectURL(file)} style={{
            textDecoration: "none",
            color: "inherit",
            display: 'flex',
            alignItems: 'center',
          }}>
            <Download/>
          </a>
        </IconButton>
      </Tooltip>
  )
}

export const SnippetDetail = (props: SnippetDetailProps) => {
  const {id, handleCloseModal} = props;
  const [code, setCode] = useState("");
  const [shareModalOppened, setShareModalOppened] = useState(false);
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false);
  const [testModalOpened, setTestModalOpened] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {data: snippet, isLoading} = useGetSnippetById(id);
  const {mutate: shareSnippet, isLoading: loadingShare} = useShareSnippet();

  // Updated format hook - now uses snippetId and version
  const {mutate: formatSnippet, isLoading: isFormatLoading, data: formatSnippetData} = useFormatSnippet();

  // New analyze hook
  const {mutate: analyzeSnippet, isLoading: isAnalyzeLoading, data: analyzeResult} = useAnalyzeSnippet();

  const {mutate: updateSnippet, isLoading: isUpdateSnippetLoading} = useUpdateSnippetById({
    onSuccess: () => queryClient.invalidateQueries(['snippet', id])
  });
  const {createSnackbar} = useSnackbarContext();

  useEffect(() => {
    if (snippet) {
      setCode(snippet.content);
    }
  }, [snippet]);

  useEffect(() => {
    if (formatSnippetData) {
      setCode(formatSnippetData);
    }
  }, [formatSnippetData]);

  async function handleShareSnippet(userId: string, permissions: SharePermissions) {
    shareSnippet({snippetId: id, userId, permissions});
  }

  const handleLoadFromFile = async (target: EventTarget & HTMLInputElement) => {
    const files = target.files;
    if (!files || !files.length) {
      createSnackbar('error', "Please select a file");
      return;
    }
    const file = files[0];
    try {
      const text = await file.text();
      setCode(text);
      createSnackbar('success', "File loaded successfully");
    } catch (e) {
      console.error(e);
      createSnackbar('error', "Error loading file");
    } finally {
      target.value = "";
    }
  };

  const handleFormat = () => {
    if (!snippet) return;
    formatSnippet({ snippetId: id, version: snippet.version });
  };

  const handleAnalyze = () => {
    if (!snippet) return;
    analyzeSnippet({ snippetId: id, version: snippet.version });
  };

  return (
      <Box p={4} minWidth={'60vw'}>
        <Box width={'100%'} p={2} display={'flex'} justifyContent={'flex-end'}>
          <CloseIcon style={{cursor: "pointer"}} onClick={handleCloseModal}/>
        </Box>
        {
          isLoading ? (<>
            <Typography fontWeight={"bold"} mb={2} variant="h4">Loading...</Typography>
            <CircularProgress/>
          </>) : <>
            <Typography variant="h4" fontWeight={"bold"}>{snippet?.name ?? "Snippet"}</Typography>
            <Box display="flex" flexDirection="row" gap="8px" padding="8px">
              <Tooltip title={"Share"}>
                <IconButton onClick={() => setShareModalOppened(true)}>
                  <Share/>
                </IconButton>
              </Tooltip>
              <Tooltip title={"Test"}>
                <IconButton onClick={() => setTestModalOpened(true)}>
                  <BugReport/>
                </IconButton>
              </Tooltip>
              <DownloadButton snippet={snippet}/>
              <Tooltip title={"Load from file"}>
                <IconButton onClick={() => fileInputRef?.current?.click()}>
                  <Upload/>
                </IconButton>
              </Tooltip>
              <Tooltip title={"Format"}>
                <IconButton onClick={handleFormat} disabled={isFormatLoading}>
                  <ReadMoreIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={"Analyze"}>
                <IconButton onClick={handleAnalyze} disabled={isAnalyzeLoading} color={analyzeResult?.isValid ? "success" : "default"}>
                  <CheckCircle />
                </IconButton>
              </Tooltip>
              <Tooltip title={"Save changes"}>
                <IconButton color={"primary"} onClick={() => updateSnippet({id: id, updateSnippet: {content: code}})} disabled={isUpdateSnippetLoading || snippet?.content === code} >
                  <Save />
                </IconButton>
              </Tooltip>
              <Tooltip title={"Delete"}>
                <IconButton onClick={() => setDeleteConfirmationModalOpen(true)} >
                  <Delete color={"error"} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Show analysis results */}
            {analyzeResult && (
                <Box mb={2}>
                  {analyzeResult.isValid ? (
                      <Alert severity="success">Code is valid and compliant!</Alert>
                  ) : (
                      <Alert severity="error">
                        <Typography variant="subtitle2" fontWeight="bold">
                          Found {analyzeResult.violations.length} issue(s):
                        </Typography>
                        {analyzeResult.violations.map((violation, idx) => (
                            <Box key={idx} mt={1}>
                              <Chip
                                  label={`Line ${violation.line}, Col ${violation.column}`}
                                  size="small"
                                  color="error"
                                  sx={{ mr: 1 }}
                              />
                              {violation.message}
                            </Box>
                        ))}
                      </Alert>
                  )}
                </Box>
            )}

            <Box display={"flex"} gap={2}>
              <Bòx flex={1} height={"fit-content"} overflow={"none"} minHeight={"500px"} bgcolor={'black'} color={'white'} code={code}>
                <Editor
                    value={code}
                    padding={10}
                    onValueChange={(code) => setCode(code)}
                    highlight={(code) => highlight(code, languages.js, "javascript")}
                    maxLength={1000}
                    style={{
                      minHeight: "500px",
                      fontFamily: "monospace",
                      fontSize: 17,
                    }}
                />
              </Bòx>
            </Box>
            <Box pt={1} flex={1} marginTop={2}>
              <Alert severity="info">Output</Alert>
              <SnippetExecution />
            </Box>
          </>
        }
        <ShareSnippetModal loading={loadingShare || isLoading} open={shareModalOppened}
                           onClose={() => setShareModalOppened(false)}
                           onShare={handleShareSnippet}/>
        {snippet && (
            <TestSnippetModal
                open={testModalOpened}
                onClose={() => setTestModalOpened(false)}
                snippetId={id}
                version={snippet.version}
            />
        )}
        <DeleteConfirmationModal open={deleteConfirmationModalOpen} onClose={() => setDeleteConfirmationModalOpen(false)} id={snippet?.id ?? ""} setCloseDetails={handleCloseModal} />
        <input
            hidden
            type="file"
            ref={fileInputRef}
            multiple={false}
            data-testid="snippet-detail-upload-file-input"
            onChange={(e) => handleLoadFromFile(e.target)}
        />
      </Box>
  );
}