import {useEffect, useRef, useState} from "react";
import Editor from "react-simple-code-editor";
import {highlight, languages} from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-okaidia.css";
import {Alert, Box, CircularProgress, IconButton, Tooltip, Typography, Chip, Button, MenuItem, Select, FormControl, InputLabel} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {
  useUpdateSnippetById
} from "../utils/queries.tsx";
import {useFormatSnippet, useGetSnippetById, useShareSnippet, useAnalyzeSnippet, useGetTestCases, useTestSnippet, useDownloadFormattedSnippet} from "../utils/queries.tsx";
import {SnippetBox} from "../components/snippet-table/SnippetBox.tsx";
import {BugReport, Delete, Download, Save, Share, Upload, CheckCircle, PlayArrow} from "@mui/icons-material";
import {ShareSnippetModal} from "../components/snippet-detail/ShareSnippetModal.tsx";
import {TestSnippetModal} from "../components/snippet-test/TestSnippetModal.tsx";
import {SnippetExecution} from "./SnippetExecution.tsx";
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import {queryClient} from "../App.tsx";
import {DeleteConfirmationModal} from "../components/snippet-detail/DeleteConfirmationModal.tsx";
import {DownloadModal} from "../components/snippet-detail/DownloadModal.tsx";
import {useSnackbarContext} from "../contexts/snackbarContext.tsx";
import { SharePermissions } from "../utils/snippetOperations";
import {useSnippetsOperations} from "../utils/queries.tsx";
import {TestCaseResult} from "../types/TestCaseResult.ts";

type SnippetDetailProps = {
  id: string;
  handleCloseModal: () => void;
}


export const SnippetDetail = (props: SnippetDetailProps) => {
  const {id, handleCloseModal} = props;
  const [code, setCode] = useState("");
  const [shareModalOppened, setShareModalOppened] = useState(false);
  const [deleteConfirmationModalOpen, setDeleteConfirmationModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [testModalOpened, setTestModalOpened] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestCaseResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const snippetOperations = useSnippetsOperations();

  const {data: snippet, isLoading} = useGetSnippetById(id);
  const {data: testCases} = useGetTestCases(id);
  const {mutate: shareSnippet, isLoading: loadingShare} = useShareSnippet();

  const {mutate: formatSnippet, isLoading: isFormatLoading, data: formatSnippetData} = useFormatSnippet();

  const {mutate: analyzeSnippet, isLoading: isAnalyzeLoading, data: analyzeResult} = useAnalyzeSnippet();

  const {mutateAsync: testSnippet, isLoading: isTestLoading} = useTestSnippet();

  const {mutate: updateSnippet, isLoading: isUpdateSnippetLoading} = useUpdateSnippetById({
    onSuccess: () => queryClient.invalidateQueries(['snippet', id])
  });

  const {mutateAsync: downloadFormatted, isLoading: isDownloadFormattedLoading} = useDownloadFormattedSnippet();

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

  const handleDownloadOriginal = () => {
    if (!snippet) return;

    const file = new Blob([snippet.content], {type: 'text/plain'});
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snippet.name}.${snippet.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    createSnackbar('success', 'Snippet downloaded successfully');
  };

  const handleDownloadFormatted = async () => {
    if (!snippet) return;

    try {
      const blob = await downloadFormatted({ snippetId: id, version: snippet.version });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${snippet.name}-formatted.${snippet.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      createSnackbar('success', 'Formatted snippet downloaded successfully');
    } catch (error) {
      createSnackbar('error', 'Error downloading formatted snippet');
      console.error(error);
    }
  };

  const validateCode = async (content: string): Promise<boolean> => {
    if (!content.trim()) {
      setError("Code cannot be empty");
      return false;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await snippetOperations.validateContent(
          content,
          snippet?.language ?? "PRINTSCRIPT",
          snippet?.version ?? "1.0"
      );

      if (!result.isValid) {
        setError("Code does not parse");
        createSnackbar('error', 'Code does not parse');
        return false;
      }

      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to validate code';
      setError(errorMessage);
      createSnackbar('error', errorMessage);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    const isValid = await validateCode(code);
    if (!isValid) return;

    setError(null);
    updateSnippet({id: id, updateSnippet: {content: code}});
  };

  const handleRunTest = async () => {
    if (!selectedTestId || !snippet) return;

    try {
      const result = await testSnippet({
        snippetId: id,
        version: snippet.version,
        testId: parseInt(selectedTestId)
      });
      setTestResult(result);
      createSnackbar(result.passed ? 'success' : 'error', result.passed ? 'Test passed!' : 'Test failed');
    } catch (error) {
      createSnackbar('error', 'Error running test');
      console.error(error);
    }
  };

  const handleSelectTest = (testId: string) => {
    setSelectedTestId(testId);
    setTestResult(null);
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
              <Tooltip title={"Download"}>
                <IconButton onClick={() => setDownloadModalOpen(true)}>
                  <Download/>
                </IconButton>
              </Tooltip>
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
                <IconButton
                    color={"primary"}
                    onClick={handleSave}
                    disabled={isUpdateSnippetLoading || isValidating || snippet?.content === code}
                >
                  {isValidating ? <CircularProgress size={24} /> : <Save />}
                </IconButton>
              </Tooltip>
              <Tooltip title={"Delete"}>
                <IconButton onClick={() => setDeleteConfirmationModalOpen(true)} >
                  <Delete color={"error"} />
                </IconButton>
              </Tooltip>
            </Box>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {error}
                  </Typography>
                </Alert>
            )}

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

            {testCases && testCases.length > 0 && (
                <Box mb={2} display="flex" alignItems="center" gap={2}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Select Test</InputLabel>
                    <Select
                        value={selectedTestId || ''}
                        onChange={(e) => handleSelectTest(e.target.value)}
                        label="Select Test"
                    >
                      {testCases.map((test) => (
                          <MenuItem key={test.id} value={test.id || ''}>
                            {test.name}
                          </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                      variant="contained"
                      startIcon={isTestLoading ? <CircularProgress size={20} /> : <PlayArrow />}
                      onClick={handleRunTest}
                      disabled={!selectedTestId || isTestLoading}
                      disableElevation
                  >
                    Run Test
                  </Button>
                </Box>
            )}

            {testResult && (
                <Box mb={2}>
                  <Alert severity={testResult.passed ? "success" : "error"}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Test {testResult.passed ? "Passed ✅" : "Failed ❌"} - Check Output section below for details
                    </Typography>
                  </Alert>
                </Box>
            )}

            <Box display={"flex"} gap={2}>
              <SnippetBox flex={1} height={"fit-content"} overflow={"none"} minHeight={"500px"} bgcolor={'black'} color={'white'} code={code}>
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
              </SnippetBox>
            </Box>
            <Box pt={1} flex={1} marginTop={2}>
              <Alert severity="info">Output</Alert>
              {testResult ? (
                  <Box mt={2} p={2} bgcolor="background.paper" borderRadius={1} border={1} borderColor="divider">
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      Test Results: {testResult.passed ? '✅ Passed' : '❌ Failed'}
                    </Typography>

                    {testResult.outputs && testResult.outputs.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                            Actual Outputs:
                          </Typography>
                          <Box bgcolor="grey.900" p={2} borderRadius={1} fontFamily="monospace">
                            {testResult.outputs.map((output, idx) => (
                                <Typography key={idx} color="success.light" variant="body2">
                                  {output}
                                </Typography>
                            ))}
                          </Box>
                        </Box>
                    )}

                    {testResult.expectedOutputs && testResult.expectedOutputs.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                            Expected Outputs:
                          </Typography>
                          <Box bgcolor="grey.900" p={2} borderRadius={1} fontFamily="monospace">
                            {testResult.expectedOutputs.map((output, idx) => (
                                <Typography key={idx} color="info.light" variant="body2">
                                  {output}
                                </Typography>
                            ))}
                          </Box>
                        </Box>
                    )}

                    {testResult.errors && testResult.errors.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold" color="error" mb={1}>
                            Errors:
                          </Typography>
                          <Box bgcolor="grey.900" p={2} borderRadius={1} fontFamily="monospace">
                            {testResult.errors.map((error, idx) => (
                                <Typography key={idx} color="error.light" variant="body2">
                                  {error}
                                </Typography>
                            ))}
                          </Box>
                        </Box>
                    )}
                  </Box>
              ) : (
                  <SnippetExecution snippetId={id} />
              )}
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
                onSelectTest={handleSelectTest}
            />
        )}
        <DeleteConfirmationModal open={deleteConfirmationModalOpen} onClose={() => setDeleteConfirmationModalOpen(false)} id={snippet?.id ?? ""} setCloseDetails={handleCloseModal} />
        {snippet && (
            <DownloadModal
                open={downloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
                snippet={snippet}
                onDownloadOriginal={handleDownloadOriginal}
                onDownloadFormatted={handleDownloadFormatted}
                isLoadingFormatted={isDownloadFormattedLoading}
            />
        )}
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