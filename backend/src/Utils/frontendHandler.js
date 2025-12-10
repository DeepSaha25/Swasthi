
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.static(path.join(__dirname, '../../www')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../www/index.html'));
});
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../../www/card.html'));
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is live on http://localhost:${PORT}`);
});