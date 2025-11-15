import {Box,  Button, Divider, Tab, Tabs, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {SyntheticEvent, useState} from "react";
import {AddRounded} from "@mui/icons-material";
import {useGetTestCases, useUpsertTestCase, useRemoveTestCase} from "../../utils/queries.tsx";
import {TabPanel} from "./TabPanel.tsx";
import {queryClient} from "../../App.tsx";
import {useSnackbarContext} from "../../contexts/snackbarContext.tsx";

type TestSnippetModalProps = {
    open: boolean
    onClose: () => void
    snippetId: string
    version: string
    onSelectTest?: (testId: string) => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const TestSnippetModal = ({open, onClose, snippetId, version: _version, onSelectTest}: TestSnippetModalProps) => {
    const [value, setValue] = useState(0);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [testToDelete, setTestToDelete] = useState<string | null>(null);
    const {createSnackbar} = useSnackbarContext();

    const {data: testCases} = useGetTestCases(snippetId);
    const {mutateAsync: upsertTestCase} = useUpsertTestCase({
        onSuccess: (data) => {
            queryClient.invalidateQueries(['testCases', snippetId]);
            const idx = testCases?.findIndex(tc => tc.id === data.id) ?? -1;
            setValue(idx >= 0 ? idx : (testCases?.length ?? 0));
        }
    });


    const {mutateAsync: removeTestCase} = useRemoveTestCase({
        onSuccess: () => {
            queryClient.invalidateQueries(['testCases', snippetId]);
            setValue(0);
            createSnackbar("success", "Test case deleted successfully");
            setDeleteConfirmOpen(false);
            setTestToDelete(null);
        }
    });

    const handleDeleteClick = (testId: string) => {
        setTestToDelete(testId);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (testToDelete) {
            try {
                await removeTestCase(testToDelete);
            } catch (error) {
                createSnackbar("error", "Error deleting test case");
                setDeleteConfirmOpen(false);
                setTestToDelete(null);
            }
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmOpen(false);
        setTestToDelete(null);
    };

    const handleChange = (_: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <ModalWrapper open={open} onClose={onClose}>
            <Typography variant={"h5"}>Test snippet</Typography>
            <Divider/>
            <Box mt={2} display="flex">
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{borderRight: 1, borderColor: 'divider'}}
                >
                    {testCases?.map((testCase) => (
                        <Tab key={testCase.id} label={testCase.name}/>
                    ))}
                    <Tab icon={<AddRounded />} onClick={() => setValue(testCases?.length ?? 0)} />
                </Tabs>
                {testCases?.map((testCase, index) => (
                    <TabPanel
                        key={testCase.id}
                        index={index}
                        value={value}
                        test={testCase}
                        snippetId={snippetId}
                        setTestCase={(tc) => upsertTestCase({ ...tc, id: testCase.id })}
                        removeTestCase={(i) => handleDeleteClick(i)}
                        onSelectTest={onSelectTest}
                        onClose={onClose}
                    />
                ))}
                <TabPanel
                    index={testCases?.length ?? 0}
                    value={value}
                    snippetId={snippetId}
                    setTestCase={(tc) => upsertTestCase(tc)}
                />
            </Box>
            <ModalWrapper open={deleteConfirmOpen} onClose={handleCancelDelete}>
                <Typography variant={"h6"}>Are you sure you want to delete this test case?</Typography>
                <Box display={"flex"} justifyContent={"center"} mt={2}>
                    <Button onClick={handleCancelDelete} variant={"outlined"}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} sx={{marginLeft: 2}} variant={"contained"} color={"error"}>Delete</Button>
                </Box>
            </ModalWrapper>
        </ModalWrapper>
    )
}