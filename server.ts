import express from "express";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Initialize Google Auth
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

const SHEET_NAMES = {
  TASKS: 'Tasks',
  COLUMNS: 'Columns',
  CHECKLISTS: 'Checklists',
  COMMENTS: 'Comments',
  MEETINGS: 'Meetings',
  AUTHORS: 'Authors',
};

const HEADERS = {
  TASKS: ['id', 'columnId', 'title', 'description', 'priority', 'tags', 'assignees', 'dueDate', 'createdAt', 'strategicDimension', 'strategicObjective'],
  COLUMNS: ['id', 'title', 'order', 'color'],
  CHECKLISTS: ['id', 'taskId', 'text', 'completed'],
  COMMENTS: ['id', 'taskId', 'author', 'content', 'createdAt'],
  MEETINGS: ['id', 'title', 'date', 'time', 'location', 'agenda', 'participants', 'notes', 'createdAt'],
  AUTHORS: ['id', 'name', 'email', 'role', 'avatar'],
};

async function ensureSheetStructure() {
  if (!SPREADSHEET_ID) return;

  try {
    const doc = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const existingSheets = doc.data.sheets?.map(s => s.properties?.title) || [];
    const requests: any[] = [];

    Object.values(SHEET_NAMES).forEach(sheetName => {
      if (!existingSheets.includes(sheetName)) {
        requests.push({
          addSheet: { properties: { title: sheetName } }
        });
      }
    });

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { requests }
      });
    }

    // Check headers and populate defaults if needed
    for (const [key, sheetName] of Object.entries(SHEET_NAMES)) {
      const headerKey = key as keyof typeof HEADERS;
      // Always update headers to ensure new columns (like 'color') are added
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [HEADERS[headerKey]] }
      });
    }

    // Populate default columns if Columns sheet is empty (only header)
    const columnsRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAMES.COLUMNS}!A2:A`
    });

    if (!columnsRes.data.values || columnsRes.data.values.length === 0) {
      const defaultColumns = [
        ['col-1', 'Backlog / Triagem', '0'],
        ['col-2', 'Em Análise', '1'],
        ['col-3', 'Aguardando Validação', '2'],
        ['col-4', 'Concluído', '3'],
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAMES.COLUMNS}!A2`,
        valueInputOption: 'RAW',
        requestBody: { values: defaultColumns }
      });
      console.log('Default columns populated.');
    }

    console.log('Sheet structure verified.');
  } catch (error) {
    console.error('Error ensuring sheet structure:', error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.get("/api/sync", async (req, res) => {
    try {
      if (!SPREADSHEET_ID) throw new Error("Spreadsheet ID not configured");

      const [tasksRes, columnsRes, checklistsRes, commentsRes, meetingsRes, authorsRes] = await Promise.all([
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAMES.TASKS}!A2:Z` }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAMES.COLUMNS}!A2:Z` }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAMES.CHECKLISTS}!A2:Z` }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAMES.COMMENTS}!A2:Z` }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAMES.MEETINGS}!A2:Z` }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: `${SHEET_NAMES.AUTHORS}!A2:Z` }),
      ]);

      const rawTasks = tasksRes.data.values || [];
      const rawColumns = columnsRes.data.values || [];
      const rawChecklists = checklistsRes.data.values || [];
      const rawComments = commentsRes.data.values || [];
      const rawMeetings = meetingsRes.data.values || [];
      const rawAuthors = authorsRes.data.values || [];

      // Transform to JSON
      const authors = rawAuthors.map((row: any[]) => ({
        id: row[0],
        name: row[1],
        email: row[2],
        role: row[3],
        avatar: row[4],
      }));

      const columns = rawColumns.map((row: any[]) => ({
        id: row[0],
        title: row[1],
        order: parseInt(row[2] || '0'),
        color: row[3] || undefined,
      })).sort((a: any, b: any) => a.order - b.order);

      const checklists = rawChecklists.map((row: any[]) => ({
        id: row[0],
        taskId: row[1],
        text: row[2],
        completed: row[3] === 'TRUE',
      }));

      const comments = rawComments.map((row: any[]) => ({
        id: row[0],
        taskId: row[1],
        author: row[2],
        content: row[3],
        createdAt: row[4],
      }));

      const meetings = rawMeetings.map((row: any[]) => ({
        id: row[0],
        title: row[1],
        date: row[2],
        time: row[3],
        location: row[4],
        agenda: row[5],
        participants: row[6] ? row[6].split(',') : [],
        notes: row[7],
        createdAt: row[8],
      }));

      const tasks = rawTasks.map((row: any[]) => {
        const taskId = row[0];
        const rawPriority = row[4]?.toLowerCase();
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        const priority = validPriorities.includes(rawPriority) ? rawPriority : 'medium';
        
        // Ensure createdAt is valid
        let createdAt = row[8];
        if (!createdAt || isNaN(new Date(createdAt).getTime())) {
            createdAt = new Date().toISOString();
        }

        return {
          id: taskId,
          columnId: row[1],
          title: row[2],
          description: row[3],
          priority: priority,
          tags: row[5] ? row[5].split(',') : [],
          assignees: row[6] ? row[6].split(',') : [],
          dueDate: row[7] || undefined,
          createdAt: createdAt,
          strategicDimension: row[9] || undefined,
          strategicObjective: row[10] || undefined,
          checklist: checklists.filter((c: any) => c.taskId === taskId),
          comments: comments.filter((c: any) => c.taskId === taskId),
        };
      }).filter((task: any) => {
        // Filter tasks older than 2 months
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        const taskDate = new Date(task.createdAt);
        return taskDate >= twoMonthsAgo;
      });

      const board = {
        id: 'board-1',
        title: 'SDSS Control',
        columns,
        tasks,
        meetings,
        authors,
      };

      res.json({ boards: [board] });
    } catch (error: any) {
      console.error('Sync error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/sync", async (req, res) => {
    try {
      if (!SPREADSHEET_ID) throw new Error("Spreadsheet ID not configured");
      const { board } = req.body;
      if (!board) throw new Error("No board data provided");

      // Prepare data
      const tasksData = board.tasks.map((t: any) => [
        t.id || '',
        t.columnId || '',
        t.title || '',
        t.description || '',
        t.priority || 'medium',
        (t.tags || []).join(','),
        (t.assignees || []).join(','),
        t.dueDate || '',
        t.createdAt || new Date().toISOString(),
        t.strategicDimension || '',
        t.strategicObjective || ''
      ]);

      const columnsData = board.columns.map((c: any) => [
        c.id,
        c.title,
        c.order,
        c.color || ''
      ]);

      const checklistsData = board.tasks.flatMap((t: any) => 
        t.checklist.map((c: any) => [c.id, t.id, c.text, c.completed ? 'TRUE' : 'FALSE'])
      );

      const commentsData = board.tasks.flatMap((t: any) => 
        t.comments.map((c: any) => [c.id, t.id, c.author, c.content, c.createdAt])
      );

      const meetingsData = (board.meetings || []).map((m: any) => [
        m.id,
        m.title,
        m.date,
        m.time,
        m.location,
        m.agenda,
        m.participants.join(','),
        m.notes,
        m.createdAt
      ]);

      const authorsData = (board.authors || []).map((a: any) => [
        a.id,
        a.name,
        a.email || '',
        a.role || '',
        a.avatar || ''
      ]);

      // Clear and Update
      const updateSheet = async (sheetName: string, data: any[]) => {
        // Always clear the sheet first to remove deleted rows
        await sheets.spreadsheets.values.clear({
          spreadsheetId: SPREADSHEET_ID,
          range: `${sheetName}!A2:Z`,
        });
        
        if (data.length > 0) {
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A2`,
            valueInputOption: 'RAW',
            requestBody: { values: data },
          });
        }
      };

      await Promise.all([
        updateSheet(SHEET_NAMES.TASKS, tasksData),
        updateSheet(SHEET_NAMES.COLUMNS, columnsData),
        updateSheet(SHEET_NAMES.CHECKLISTS, checklistsData),
        updateSheet(SHEET_NAMES.COMMENTS, commentsData),
        updateSheet(SHEET_NAMES.MEETINGS, meetingsData),
        updateSheet(SHEET_NAMES.AUTHORS, authorsData),
      ]);

      res.json({ success: true });
    } catch (error: any) {
      console.error('Save error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving would go here
    app.use(express.static('dist'));
  }

  // Initialize sheets on start
  await ensureSheetStructure();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
