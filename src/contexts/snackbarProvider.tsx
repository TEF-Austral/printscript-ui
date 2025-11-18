import {ReactNode, useState} from "react";
import {Alert, AlertColor, Box} from "@mui/material";
import {SnackbarContext, SnackBarType} from "./snackbarContext.tsx";

export const SnackbarProvider = ({children}: { children: ReactNode }) => {
    const [snackbars, setSnackbars] = useState<SnackBarType[]>([])

    const AUTO_HIDE_MS = 5000;

    const handleAddSnackbar = (severity: AlertColor, text: string) => {
        const newSnackbar = { severity, text };
        setSnackbars(prevState => [...prevState, newSnackbar]);

        setTimeout(() => {
            setSnackbars(prevState => prevState.filter(s => s !== newSnackbar));
        }, AUTO_HIDE_MS);
    }

    const handleDeleteSnackbar = (snackbar: SnackBarType) => {
        setSnackbars(prevState => prevState.filter(x => x != snackbar))
    }


    return (
        <SnackbarContext.Provider value={{
            active: snackbars,
            createSnackbar: handleAddSnackbar
        }}>
            {children}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    left: 16,
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    pointerEvents: 'none',
                }}
            >
                {snackbars.map((snackbar, i) => (
                    <Alert
                        key={i}
                        onClose={() => handleDeleteSnackbar(snackbar)}
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{
                            minWidth: '300px',
                            pointerEvents: 'auto',
                        }}
                    >
                        {snackbar.text}
                    </Alert>
                ))}
            </Box>
        </SnackbarContext.Provider>
    )
}