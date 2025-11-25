import { useAuth0 } from "@auth0/auth0-react";
import { Avatar, Box, Button, Typography } from "@mui/material";
import { Logout } from "@mui/icons-material";

export const UserProfile = () => {
    const { user, isAuthenticated, logout } = useAuth0();

    if (!isAuthenticated) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar
                    alt={user?.name}
                    src={user?.picture}
                    sx={{ width: 32, height: 32 }}
                />
                <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
                    {user?.name}
                </Typography>
            </Box>
            <Button
                color="inherit"
                variant="outlined"
                startIcon={<Logout />}
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                sx={{
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    color: 'white',
                    '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)'
                    }
                }}
            >
                Logout
            </Button>
        </Box>
    );
};