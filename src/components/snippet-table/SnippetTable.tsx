import {
  styled,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow
} from "@mui/material";
import { LoadingSnippetRow, SnippetRow } from "./SnippetRow.tsx";
import { Snippet } from "../../utils/snippet.ts";
import { usePaginationContext } from "../../contexts/paginationContext.tsx";

type SnippetTableProps = {
  handleClickSnippet: (id: string) => void;
  snippets?: Snippet[];
  loading: boolean;
}

export const SnippetTable = (props: SnippetTableProps) => {
  const { snippets, handleClickSnippet, loading } = props;
  const { page, page_size: pageSize, count, handleChangePageSize, handleGoToPage } = usePaginationContext();

  return (
      <>
        <Table size="medium" sx={{ borderSpacing: "0 10px", borderCollapse: "separate" }}>
          <TableHead>
            <TableRow sx={{ fontWeight: 'bold' }}>
              <StyledTableCell sx={{ fontWeight: "bold" }}>Name</StyledTableCell>
              <StyledTableCell sx={{ fontWeight: "bold" }}>Language</StyledTableCell>
              <StyledTableCell sx={{ fontWeight: "bold" }}>Author</StyledTableCell>
              <StyledTableCell sx={{ fontWeight: "bold" }}>Compliance Status</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>{
            loading ? (
                <>
                  {Array.from({ length: 10 }).map((_, index) => (
                      <LoadingSnippetRow key={index} />
                  ))}
                </>
            ) : (
                <>
                  {
                      snippets && snippets.map((snippet) => (
                          <SnippetRow data-testid={"snippet-row"}
                                      onClick={() => handleClickSnippet(snippet.id)} key={snippet.id} snippet={snippet} />
                      ))
                  }
                </>
            )
          }
          </TableBody>
          <TablePagination count={count} page={page} rowsPerPage={pageSize}
                           onPageChange={(_, page) => handleGoToPage(page)}
                           onRowsPerPageChange={e => handleChangePageSize(Number(e.target.value))} />
        </Table>
      </>
  );
};

export const StyledTableCell = styled(TableCell)`
  border: 0;
  align-items: center;
`;