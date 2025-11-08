import {Box,  Divider, Tab, Tabs, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {SyntheticEvent, useState} from "react";
import {AddRounded} from "@mui/icons-material";
import {useGetTestCases, usePostTestCase, useRemoveTestCase} from "../../utils/queries.tsx";
import {TabPanel} from "./TabPanel.tsx";
import {queryClient} from "../../App.tsx";

type TestSnippetModalProps = {
    open: boolean
    onClose: () => void
    snippetId: string
    version: string
}

export const TestSnippetModal = ({open, onClose, snippetId, version}: TestSnippetModalProps) => {
    const [value, setValue] = useState(0);

    const {data: testCases} = useGetTestCases(snippetId);
    const {mutateAsync: postTestCase} = usePostTestCase();
    const {mutateAsync: removeTestCase} = useRemoveTestCase({
        onSuccess: () => queryClient.invalidateQueries('testCases')
    });

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
                        version={version}
                        setTestCase={(tc) => postTestCase(tc)}
                        removeTestCase={(i) => removeTestCase(i)}
                    />
                ))}
                <TabPanel
                    index={testCases?.length ?? 0}
                    value={value}
                    snippetId={snippetId}
                    version={version}
                    setTestCase={(tc) => postTestCase(tc)}
                />
            </Box>
        </ModalWrapper>
    )
}