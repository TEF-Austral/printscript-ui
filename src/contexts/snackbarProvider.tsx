import {ReactNode, useState} from "react";
import {Alert, AlertColor, Snackbar} from "@mui/material";
import {SnackbarContext, SnackBarType} from "./snackbarContext.tsx";

export const SnackbarProvider = ({children}: { children: ReactNode }) => {
    const [snackbars, setSnackbars] = useState<SnackBarType[]>([])

    const AUTO_HIDE_MS = 8000; // slower toasts

    const handleAddSnackbar = (severity: AlertColor, text: string) => {
        const newSnackbar = { severity, text };
        setSnackbars(prevState => [...prevState, newSnackbar]);

        // Ensure it disappears even if user doesn't manually close it
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
            <>
                {
                    snackbars.map((snackbar,i) => (
                        <Snackbar
                            key={i}
                            open={snackbars.includes(snackbar)}
                            autoHideDuration={AUTO_HIDE_MS}
                            onClose={() => handleDeleteSnackbar(snackbar)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            sx={{
                                bottom: `${16 + i * 72}px`,
                            }}
                        >
                            <Alert
                                onClose={() => handleDeleteSnackbar(snackbar)}
                                severity={snackbar.severity}
                                variant="filled"
                                sx={{width: '100%'}}
                            >
                                {snackbar.text}
                            </Alert>
                        </Snackbar>
                    ))
                }
            </>
        </SnackbarContext.Provider>
    )
}