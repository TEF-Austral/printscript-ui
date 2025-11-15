import {Box, Button, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {useDeleteSnippet} from "../../utils/queries.tsx";
import {queryClient} from "../../App.tsx";
import {useSnackbarContext} from "../../contexts/snackbarContext.tsx";

type DeleteConfirmationModalProps = {
  open: boolean
  onClose: () => void
  id: string;
  setCloseDetails: () => void;
}
export const DeleteConfirmationModal = (props: DeleteConfirmationModalProps) => {
  const {open, onClose, id, setCloseDetails} = props;
  const {createSnackbar} = useSnackbarContext();

  const {mutate: deleteSnippet} = useDeleteSnippet({
    onSuccess: async () => {
      createSnackbar('success', 'Snippet deleted successfully');
      onClose();
      setCloseDetails();
      await queryClient.invalidateQueries('listSnippets')
    },
  })

  const handleDelete = () => {
    deleteSnippet(id, {
      onError: (error: unknown) => {
        let message = 'An error occurred while deleting the snippet';
        if (error && typeof error === 'object') {
          const maybeError = error as { response?: { data?: { message?: string } }; message?: string };
            message = maybeError?.response?.data?.message || maybeError?.message || message;
        }
        createSnackbar('error', message);
      }
    });
  }

  return (
      <ModalWrapper open={open} onClose={onClose}>
        <Typography variant={"h6"}>Are you sure you want to delete this snippet?</Typography>
          <Box display={"flex"} justifyContent={"center"}>
            <Button onClick={onClose} variant={"outlined"}>Cancel</Button>
            <Button onClick={handleDelete} sx={{marginLeft: 2}} variant={"contained"} color={"error"}>Delete</Button>
          </Box>
      </ModalWrapper>
  )
}
