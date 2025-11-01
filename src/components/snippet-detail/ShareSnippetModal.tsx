import {Autocomplete, Box, Button, Checkbox, Divider, FormControlLabel, FormGroup, TextField, Typography} from "@mui/material";
import {ModalWrapper} from "../common/ModalWrapper.tsx";
import {useGetUsers} from "../../utils/queries.tsx";
import {useEffect, useState} from "react";
import {User} from "../../utils/users.ts";
import { Permission } from "../../utils/snippetOperations";

type ShareSnippetModalProps = {
  open: boolean
  onClose: () => void
  onShare: (userId: string, permissions: Permission[] ) => void
  loading: boolean
}
export const ShareSnippetModal = (props: ShareSnippetModalProps) => {
  const {open, onClose, onShare, loading} = props
  const [name, setName] = useState("")
  const [debouncedName, setDebouncedName] = useState("")
  const {data, isLoading} = useGetUsers(debouncedName, 1, 5)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [canRead, setCanRead] = useState(true)
  const [canWrite, setCanWrite] = useState(false)

  useEffect(() => {
    const getData = setTimeout(() => {
      setDebouncedName(name)
    }, 3000)
    return () => clearTimeout(getData)
  }, [name])

  function handleSelectUser(newValue: User | null) {
    newValue && setSelectedUser(newValue)
  }

  return (
      <ModalWrapper open={open} onClose={onClose}>
        <Typography variant={"h5"}>Share your snippet</Typography>
        <Divider/>
        <Box mt={2}>
          <Autocomplete
              renderInput={(params) => <TextField {...params} label="Type the user's name"/>}
              options={data?.users ?? []}
              isOptionEqualToValue={(option, value) =>
                  option.id === value.id
              }
              getOptionLabel={(option) => option.name}
              loading={isLoading}
              value={selectedUser}
              onInputChange={(_: unknown, newValue: string | null) => {
                setName(newValue ?? "");
                if (!newValue) setSelectedUser(undefined);
              }}
              onChange={(_: unknown, newValue: User | null) => handleSelectUser(newValue)}
          />
          <Box mt={2}>
            <Typography variant="subtitle1">Permissions</Typography>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={canRead} onChange={(_, checked) => setCanRead(checked)} />}
                label="Read"
              />
              <FormControlLabel
                control={<Checkbox checked={canWrite} onChange={(_, checked) => setCanWrite(checked)} />}
                label="Write"
              />
            </FormGroup>
          </Box>
          <Box mt={4} display={"flex"} width={"100%"} justifyContent={"flex-end"}>
            <Button onClick={onClose} variant={"outlined"}>Cancel</Button>
            <Button
              disabled={!selectedUser || loading || !(canRead || canWrite)}
              onClick={() => {
                if (!selectedUser) return
                const permissions: Permission[] = []
                if (canRead) permissions.push("read")
                if (canWrite) permissions.push("write")
                onShare(selectedUser.id, permissions)
              }}
              sx={{marginLeft: 2}}
              variant={"contained"}
            >
              Share
            </Button>
          </Box>
        </Box>
      </ModalWrapper>
  )
}
