import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());

app.get('/juno2k25/namelist', async (req, res) => {
  const { data, error } = await supabase.from('namelist').select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.get('/juno2k25/rolelist', async (req, res) => {
  const { data, error } = await supabase.from('rolelist').select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.get('/juno2k25/teamlist', async (req, res) => {
  const { data, error } = await supabase.from('teamlist').select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.get('/juno2k25/team-members', async (req, res) => {
  try {
    const { data: assignData, error: assignError } = await supabase
      .from('assignteamlist')
      .select('ASSIGN_NAME, ASSIGN_TEAM');

    if (assignError) {
      return res.status(500).json({ error: assignError.message });
    }

    const { data: nameData, error: nameError } = await supabase
      .from('namelist')
      .select('NAME_ID, NAME')
      .in('NAME_ID', assignData.map(item => item.ASSIGN_NAME));

    if (nameError) {
      return res.status(500).json({ error: nameError.message });
    }

    const { data: teamData, error: teamError } = await supabase
      .from('teamlist')
      .select('TEAM_ID, TEAM_NAME')
      .in('TEAM_ID', assignData.map(item => item.ASSIGN_TEAM));

    if (teamError) {
      return res.status(500).json({ error: teamError.message });
    }

    const groupedMembers = assignData.reduce((acc, assignment) => {
      const member = nameData.find(name => name.NAME_ID === assignment.ASSIGN_NAME);
      const team = teamData.find(t => t.TEAM_ID === assignment.ASSIGN_TEAM);

      if (team) {
        const teamName = team.TEAM_NAME;
        if (!acc[teamName]) {
          acc[teamName] = [];
        }

        acc[teamName].push({
          name_id: assignment.ASSIGN_NAME,
          name: member ? member.NAME : null
        });
      }
      return acc;
    }, {});

    res.json(groupedMembers);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
