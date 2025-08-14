import { AppBar } from "@mui/material";
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import {useNavigate} from "react-router";

const pages = ['Home', 'Encounters'];


export const NavAppBar = () => {
    let navigate = useNavigate();

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                    {pages.map((page) => (
                    <Button
                        key={page}
                        onClick={() => {
                            if (page === 'Home') {
                                navigate('/');
                            } else {
                                navigate(`/${page.toLowerCase()}`);
                            }
                        }}
                        sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                        {page}
                    </Button>
                    ))}
                </Box>
            </Container>
        </AppBar>
    );
}
