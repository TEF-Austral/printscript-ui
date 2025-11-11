import {Box, Button, CircularProgress, Divider, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {Snippet} from "../../utils/snippet.ts";

type DownloadModalProps = {
    open: boolean
    onClose: () => void
    snippet: Snippet
    onDownloadOriginal: () => void
    onDownloadFormatted: () => void
    isLoadingFormatted: boolean
}

export const DownloadModal = (props: DownloadModalProps) => {
    const {open, onClose, onDownloadOriginal, onDownloadFormatted, isLoadingFormatted} = props

    return (
        <ModalWrapper open={open} onClose={onClose}>
            <Typography variant={"h5"}>Download Snippet</Typography>
            <Divider/>
            <Box mt={2} display={"flex"} flexDirection={"column"} gap={2}>
                <Button
                    variant={"contained"}
                    onClick={() => {
                        onDownloadOriginal()
                        onClose()
                    }}
                    fullWidth
                    size="large"
                >
                    Download Original
                </Button>
                <Button
                    variant={"contained"}
                    color={"secondary"}
                    onClick={() => {
                        onDownloadFormatted()
                        onClose()
                    }}
                    disabled={isLoadingFormatted}
                    fullWidth
                    size="large"
                    startIcon={isLoadingFormatted ? <CircularProgress size={20} /> : null}
                >
                    Download Formatted
                </Button>
            </Box>
            <Box mt={2} display={"flex"} width={"100%"} justifyContent={"flex-end"}>
                <Button onClick={onClose} variant={"outlined"}>Cancel</Button>
            </Box>
        </ModalWrapper>
    )
}

