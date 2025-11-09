import { withNavbar } from "../components/navbar/withNavbar.tsx";
import { SnippetTable } from "../components/snippet-table/SnippetTable.tsx";
import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { SnippetDetail } from "./SnippetDetail.tsx";
import { Drawer, Menu, MenuItem, Box } from "@mui/material";
import { useGetSnippets, useGetFileTypes } from "../utils/queries.tsx";
import { usePaginationContext } from "../contexts/paginationContext.tsx";
import { SnippetFiltersComponent } from "../components/snippet-table/SnippetFilters.tsx";
import { SnippetFilters, defaultFilters } from "../types/SnippetFilter.types.ts";
import { AddSnippetModal } from "../components/snippet-table/AddSnippetModal.tsx";
import { CreateSnippetWithLang, getFileLanguage } from "../utils/snippet.ts";
import { useSnackbarContext } from "../contexts/snackbarContext.tsx";

const HomeScreen = () => {
    const { id: paramsId } = useParams<{ id: string }>();
    const [snippetId, setSnippetId] = useState<string | null>(null);
    const [filters, setFilters] = useState<SnippetFilters>(defaultFilters);
    const [addModalOpened, setAddModalOpened] = useState(false);
    const [popoverMenuOpened, setPopoverMenuOpened] = useState(false);
    const [snippet, setSnippet] = useState<CreateSnippetWithLang | undefined>();

    const popoverRef = useRef<HTMLButtonElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const { page, page_size, count, handleChangeCount } = usePaginationContext();
    const { data, isLoading } = useGetSnippets(page, page_size, filters);
    const { data: fileTypes } = useGetFileTypes();
    const { createSnackbar } = useSnackbarContext();

    useEffect(() => {
        if (data?.count && data.count != count) {
            handleChangeCount(data.count);
        }
    }, [count, data?.count, handleChangeCount]);

    useEffect(() => {
        if (paramsId) {
            setSnippetId(paramsId);
        }
    }, [paramsId]);

    const handleCloseModal = () => setSnippetId(null);

    const handleFiltersChange = (newFilters: SnippetFilters) => {
        setFilters(newFilters);
    };

    const handleOpenAddMenu = () => {
        setPopoverMenuOpened(true);
    };

    const handleClickMenu = () => {
        setPopoverMenuOpened(false);
    };

    const handleLoadSnippet = async (target: EventTarget & HTMLInputElement) => {
        const files = target.files;
        if (!files || !files.length) {
            createSnackbar('error', "Please select at least one file");
            return;
        }
        const file = files[0];
        const splitName = file.name.split(".");
        const fileType = getFileLanguage(fileTypes ?? [], splitName.at(-1));
        if (!fileType) {
            createSnackbar('error', `File type ${splitName.at(-1)} not supported`);
            return;
        }
        file.text().then((text) => {
            setSnippet({
                name: splitName[0],
                content: text,
                language: fileType.language,
                extension: fileType.extension,
                description: "",
                version: "1.0"
            });
        }).catch(e => {
            console.error(e);
        }).finally(() => {
            setAddModalOpened(true);
            target.value = "";
        });
    };

    return (
        <>
            <Box ref={popoverRef} sx={{ position: 'absolute', top: 0, right: 0 }} />
            <Box>HOLA</Box>
            <SnippetFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onAddSnippet={handleOpenAddMenu}
            />
            <SnippetTable
                loading={isLoading}
                handleClickSnippet={setSnippetId}
                snippets={data?.snippets}
            />
            <Drawer
                open={!!snippetId}
                anchor={"right"}
                onClose={handleCloseModal}
                ModalProps={{
                    keepMounted: false, // This helps with cleanup
                }}
            >
                {snippetId && <SnippetDetail handleCloseModal={handleCloseModal} id={snippetId} />}
            </Drawer>
            <AddSnippetModal defaultSnippet={snippet} open={addModalOpened}
                             onClose={() => setAddModalOpened(false)} />
            <Menu anchorEl={popoverRef.current} open={popoverMenuOpened} onClose={handleClickMenu}>
                <MenuItem onClick={() => {
                    setAddModalOpened(true);
                    handleClickMenu();
                }}>Create snippet</MenuItem>
                <MenuItem onClick={() => {
                    inputRef?.current?.click();
                    handleClickMenu();
                }}>Load snippet from file</MenuItem>
            </Menu>
            <input hidden type={"file"} ref={inputRef} multiple={false}
                   onChange={e => handleLoadSnippet(e?.target)} />
        </>
    );
};

export default withNavbar(HomeScreen);