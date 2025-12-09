import React, { useState } from 'react';
import { ViewState, Team, Match, Tournament } from './types';
import MatchCard from './components/MatchCard';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Activity, 
  Plus, 
  Trash2, 
  Sparkles, 
  Menu,
  ChevronDown,
  ChevronUp,
  UserPlus,
  User,
  X,
  Medal,
  ArrowLeft,
  Edit2,
  FolderPlus,
  LayoutGrid
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const POSITIONS = [
  'Passeur',
  'Récep-Attaque',
  'Pointu',
  'Central',
  'Libero'
];

// --- Helpers ---

// Helper: Fisher-Yates Shuffle to randomize arrays
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Helper: Generate Randomized Round Robin Schedule
const generateRoundRobinMatches = (teams: Team[]): Match[] => {
  const matches: Match[] = [];
  
  // 1. Shuffle teams initially
  let rotation = shuffleArray([...teams]);
  
  // Add dummy if odd number of teams
  if (rotation.length % 2 !== 0) {
    rotation.push({ id: 'dummy', name: 'BYE', players: [], points: 0, matchesPlayed: 0, setsWon: 0, setsLost: 0, pointsWon: 0, pointsLost: 0 });
  }

  const numRounds = rotation.length - 1;
  const half = rotation.length / 2;

  for (let round = 0; round < numRounds; round++) {
    const roundMatches: Match[] = [];

    for (let i = 0; i < half; i++) {
      const t1 = rotation[i];
      const t2 = rotation[rotation.length - 1 - i];

      if (t1.id !== 'dummy' && t2.id !== 'dummy') {
         // Randomize Home/Away assignment
         const isHome = Math.random() > 0.5;
         const teamA = isHome ? t1 : t2;
         const teamB = isHome ? t2 : t1;

         roundMatches.push({
            id: Math.random().toString(36).substr(2, 9),
            teamAId: teamA.id,
            teamBId: teamB.id,
            teamAName: teamA.name,
            teamBName: teamB.name,
            sets: [{ teamA: 0, teamB: 0 }],
            currentSet: 0,
            status: 'SCHEDULED',
            round: `Journée ${round + 1}`
         });
      }
    }
    
    // 2. Shuffle the order of matches within the round
    matches.push(...shuffleArray(roundMatches));
    
    // Rotate
    const fixed = rotation[0];
    const tail = rotation.slice(1);
    const last = tail.pop();
    if (last) tail.unshift(last);
    rotation = [fixed, ...tail];
  }
  
  return matches;
};

// Helper: Recalculate standings based on matches
const calculateStandings = (teams: Team[], matches: Match[]): Team[] => {
  const newTeams = teams.map(t => ({ 
    ...t, 
    points: 0, matchesPlayed: 0, setsWon: 0, setsLost: 0, pointsWon: 0, pointsLost: 0 
  }));

  matches.filter(m => m.status === 'FINISHED').forEach(m => {
    const teamA = newTeams.find(t => t.id === m.teamAId);
    const teamB = newTeams.find(t => t.id === m.teamBId);

    if (teamA && teamB) {
      // Stats
      teamA.matchesPlayed++;
      teamB.matchesPlayed++;

      let setsA = 0;
      let setsB = 0;
      let pointsA = 0;
      let pointsB = 0;

      m.sets.forEach(s => {
        if (s.teamA > s.teamB) setsA++; else setsB++;
        pointsA += s.teamA;
        pointsB += s.teamB;
      });

      teamA.setsWon += setsA;
      teamA.setsLost += setsB;
      teamA.pointsWon += pointsA;
      teamA.pointsLost += pointsB;

      // Custom Scoring Logic:
      // Match gagné : 3 points
      // Match perdu par un set d'écart (ex: 2-3) : 2 points
      // Match perdu avec plus d'un set d'écart (ex: 1-3, 0-3) : 1 point
      
      if (setsA > setsB) {
        // Team A wins
        teamA.points += 3;
        
        // Team B loses
        if ((setsA - setsB) === 1) {
           teamB.points += 2; // Lost by 1 set (3-2)
        } else {
           teamB.points += 1; // Lost by >1 set (3-0, 3-1)
        }
      } else {
        // Team B wins
        teamB.points += 3;

        // Team A loses
        if ((setsB - setsA) === 1) {
           teamA.points += 2; // Lost by 1 set (3-2)
        } else {
           teamA.points += 1; // Lost by >1 set (3-0, 3-1)
        }
      }
    }
  });

  // Sort by points, then ratio
  newTeams.sort((a, b) => b.points - a.points || (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost));
  return newTeams;
};

const App: React.FC = () => {
  // Global App State
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: 'default',
      name: 'Championnat Départemental',
      createdAt: Date.now(),
      teams: [
        { 
          id: 't1', 
          name: 'Paris Volley', 
          players: [
            { id: 'p1', name: 'Jean Dupont', position: 'Passeur', pointsScored: 12 },
            { id: 'p2', name: 'Lucas Martin', position: 'Central', pointsScored: 24 }
          ],
          points: 0, matchesPlayed: 0, setsWon: 0, setsLost: 0, pointsWon: 0, pointsLost: 0 
        },
        { id: 't2', name: 'Tours VB', players: [], points: 0, matchesPlayed: 0, setsWon: 0, setsLost: 0, pointsWon: 0, pointsLost: 0 },
        { id: 't3', name: 'Montpellier', players: [], points: 0, matchesPlayed: 0, setsWon: 0, setsLost: 0, pointsWon: 0, pointsLost: 0 },
        { id: 't4', name: 'Chaumont', players: [], points: 0, matchesPlayed: 0, setsWon: 0, setsLost: 0, pointsWon: 0, pointsLost: 0 },
      ],
      matches: []
    }
  ]);
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);
  
  // View State within a Tournament
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // Inputs & UI State
  const [inputTournamentName, setInputTournamentName] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  const [inputTeamName, setInputTeamName] = useState('');
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [inputPlayerName, setInputPlayerName] = useState('');
  const [inputPlayerPosition, setInputPlayerPosition] = useState(POSITIONS[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Computed: Active Tournament
  const activeTournament = tournaments.find(t => t.id === activeTournamentId);

  // --- Helpers for updating active tournament ---
  const updateActiveTournament = (updater: (t: Tournament) => Tournament) => {
    if (!activeTournamentId) return;
    setTournaments(prev => prev.map(t => {
      if (t.id === activeTournamentId) {
        return updater(t);
      }
      return t;
    }));
  };

  // --- Tournament Management Handlers ---

  const handleCreateTournament = () => {
    if (!inputTournamentName.trim()) return;
    const newTournament: Tournament = {
      id: Math.random().toString(36).substr(2, 9),
      name: inputTournamentName,
      createdAt: Date.now(),
      teams: [],
      matches: []
    };
    setTournaments([...tournaments, newTournament]);
    setInputTournamentName('');
    setActiveTournamentId(newTournament.id);
    setView(ViewState.SETUP);
  };

  const handleDeleteTournament = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce tournoi ?")) {
      setTournaments(tournaments.filter(t => t.id !== id));
      if (activeTournamentId === id) setActiveTournamentId(null);
    }
  };

  const handleRenameTournament = () => {
    if (editedTitle.trim()) {
      updateActiveTournament(t => ({ ...t, name: editedTitle }));
    }
    setIsEditingTitle(false);
  };

  // --- Team & Player Handlers ---

  const handleAddTeam = () => {
    if (!inputTeamName.trim()) return;
    const newTeam: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name: inputTeamName,
      players: [],
      points: 0, matchesPlayed: 0, setsWon: 0, setsLost: 0, pointsWon: 0, pointsLost: 0
    };
    
    updateActiveTournament(t => ({
      ...t,
      teams: [...t.teams, newTeam]
    }));
    setInputTeamName('');
  };

  const handleRemoveTeam = (id: string) => {
    updateActiveTournament(t => ({
      ...t,
      teams: t.teams.filter(team => team.id !== id)
    }));
  };

  const handleAddPlayer = (teamId: string) => {
    if (!inputPlayerName.trim()) return;
    
    updateActiveTournament(t => ({
      ...t,
      teams: t.teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            players: [
              ...team.players, 
              { 
                id: Math.random().toString(36).substr(2, 9), 
                name: inputPlayerName,
                position: inputPlayerPosition,
                pointsScored: 0
              }
            ]
          };
        }
        return team;
      })
    }));
    setInputPlayerName('');
  };

  const handleRemovePlayer = (teamId: string, playerId: string) => {
    updateActiveTournament(t => ({
      ...t,
      teams: t.teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            players: team.players.filter(p => p.id !== playerId)
          };
        }
        return team;
      })
    }));
  };

  const handleUpdatePlayerPoints = (teamId: string, playerId: string, delta: number) => {
    updateActiveTournament(t => ({
      ...t,
      teams: t.teams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            players: team.players.map(p => {
              if (p.id === playerId) {
                return { ...p, pointsScored: Math.max(0, p.pointsScored + delta) };
              }
              return p;
            })
          };
        }
        return team;
      })
    }));
  };

  const toggleTeamExpand = (id: string) => {
    if (expandedTeamId === id) {
      setExpandedTeamId(null);
    } else {
      setExpandedTeamId(id);
      setInputPlayerName(''); 
      setInputPlayerPosition(POSITIONS[0]);
    }
  };

  // --- Schedule Handlers ---

  const handleGenerateSchedule = () => {
    if (!activeTournament || activeTournament.teams.length < 2) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      const generatedMatches = generateRoundRobinMatches(activeTournament.teams);
      updateActiveTournament(t => ({
        ...t,
        matches: generatedMatches
      }));
      setView(ViewState.MATCHES);
      setIsGenerating(false);
    }, 600);
  };

  const handleMatchUpdate = (updatedMatch: Match) => {
    updateActiveTournament(t => {
      const newMatches = t.matches.map(m => m.id === updatedMatch.id ? updatedMatch : m);
      // Immediately calculate standings on match update
      const newTeams = calculateStandings(t.teams, newMatches);
      return {
        ...t,
        matches: newMatches,
        teams: newTeams
      };
    });
  };

  // --- Render Functions ---

  const renderTournamentList = () => (
    <div className="max-w-5xl mx-auto p-6 md:p-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Mes Tournois</h1>
        <p className="text-slate-500 text-lg">Gérez vos compétitions de volley-ball en toute simplicité.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 border-dashed hover:border-indigo-500 hover:ring-4 hover:ring-indigo-50 transition-all group">
          <div className="flex flex-col h-full justify-center">
            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 transition-colors">
              <FolderPlus className="text-indigo-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-800 mb-4">Nouveau Tournoi</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={inputTournamentName}
                onChange={(e) => setInputTournamentName(e.target.value)}
                placeholder="Nom du tournoi..."
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTournament()}
              />
              <button 
                onClick={handleCreateTournament}
                disabled={!inputTournamentName.trim()}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        </div>

        {/* Existing Tournaments */}
        {tournaments.map(tournament => (
          <div key={tournament.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
            <div 
              className="cursor-pointer"
              onClick={() => {
                setActiveTournamentId(tournament.id);
                setView(ViewState.DASHBOARD);
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <Trophy className="text-orange-600" size={24} />
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteTournament(tournament.id); }}
                  className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{tournament.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-slate-500 mb-6">
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  {tournament.teams.length} équipes
                </div>
                <div className="flex items-center">
                  <Activity size={16} className="mr-1" />
                  {tournament.matches.length} matchs
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                setActiveTournamentId(tournament.id);
                setView(ViewState.DASHBOARD);
              }}
              className="w-full border border-indigo-100 text-indigo-600 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            >
              Ouvrir
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (!activeTournament) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold opacity-90">Matchs Joués</h3>
              <Activity className="opacity-75" />
            </div>
            <div className="text-4xl font-bold">{activeTournament.matches.filter(m => m.status === 'FINISHED').length} <span className="text-lg opacity-60 font-normal">/ {activeTournament.matches.length}</span></div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-semibold">Leader</h3>
              <Trophy className="text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{activeTournament.teams[0]?.name || '-'}</div>
            <div className="text-sm text-slate-400 mt-1">{activeTournament.teams[0]?.points || 0} points</div>
          </div>
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-500 font-semibold">Équipes</h3>
              <Users className="text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{activeTournament.teams.length}</div>
            <div className="text-sm text-slate-400 mt-1">En compétition</div>
          </div>
        </div>

        {activeTournament.teams.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Performance des Équipes (Points)</h3>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={activeTournament.teams}>
                   <XAxis dataKey="name" tick={{fontSize: 12}} stroke="#94a3b8" />
                   <YAxis stroke="#94a3b8" />
                   <Tooltip 
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     cursor={{fill: '#f1f5f9'}}
                   />
                   <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                      {activeTournament.teams.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#94a3b8'} />
                      ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        )}
        
        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 text-center">
          <p className="text-indigo-800 mb-4">Pour voir les détails complets des équipes et des joueurs, consultez les classements.</p>
          <button 
            onClick={() => setView(ViewState.RANKINGS)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center font-medium"
          >
            <Medal className="mr-2" size={18}/> Voir les Classements
          </button>
        </div>
      </div>
    );
  };

  const renderRankings = () => {
    if (!activeTournament) return null;
    // Flatten players for ranking
    const allPlayers = activeTournament.teams.flatMap(team => 
      team.players.map(player => ({
        ...player,
        teamName: team.name
      }))
    );
    
    // Sort players by points scored (descending)
    allPlayers.sort((a, b) => b.pointsScored - a.pointsScored);

    return (
      <div className="space-y-8">
        {/* Team Standings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="text-yellow-500" size={24} />
            <h3 className="text-xl font-bold text-slate-800">Classement des Équipes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3 rounded-l-lg">Rang</th>
                  <th className="px-6 py-3">Équipe</th>
                  <th className="px-6 py-3 text-center">Pts</th>
                  <th className="px-6 py-3 text-center">J</th>
                  <th className="px-6 py-3 text-center">G</th>
                  <th className="px-6 py-3 text-center rounded-r-lg">P</th>
                </tr>
              </thead>
              <tbody>
                {activeTournament.teams.map((team, index) => (
                  <tr key={team.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500'}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      <div className="flex flex-col">
                        <span>{team.name}</span>
                        <span className="text-xs text-slate-400 font-normal">{team.players.length} joueurs</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-indigo-600">{team.points}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{team.matchesPlayed}</td>
                    <td className="px-6 py-4 text-center text-green-600 font-medium">
                      {activeTournament.matches.filter(m => m.winnerId === team.id).length}
                    </td>
                    <td className="px-6 py-4 text-center text-red-500">
                      {team.matchesPlayed - activeTournament.matches.filter(m => m.winnerId === team.id).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Player Standings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Medal className="text-indigo-500" size={24} />
            <h3 className="text-xl font-bold text-slate-800">Meilleurs Joueurs du Tournoi</h3>
          </div>
          
          {allPlayers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 rounded-l-lg">Rang</th>
                    <th className="px-6 py-3">Joueur</th>
                    <th className="px-6 py-3">Équipe</th>
                    <th className="px-6 py-3">Poste</th>
                    <th className="px-6 py-3 text-right rounded-r-lg">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {allPlayers.map((player, index) => (
                    <tr key={player.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                         <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500'}`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">{player.name}</td>
                      <td className="px-6 py-4 text-slate-600">{player.teamName}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-medium border border-slate-200">
                          {player.position}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-indigo-600 text-lg">
                        {player.pointsScored}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="text-center py-12 text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
               Aucun joueur enregistré pour le moment. Ajoutez des joueurs dans le menu "Équipes".
             </div>
          )}
        </div>
      </div>
    );
  };

  const renderSetup = () => {
    if (!activeTournament) return null;
    return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestion des Équipes</h2>
            <p className="text-slate-500 mt-1">Gérez vos équipes et l'effectif des joueurs.</p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-full">
            <Users className="text-indigo-600" />
          </div>
        </div>

        {/* Add Team Input */}
        <div className="flex space-x-3 mb-8">
          <input
            type="text"
            value={inputTeamName}
            onChange={(e) => setInputTeamName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTeam()}
            placeholder="Nom de la nouvelle équipe..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button 
            onClick={handleAddTeam}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl font-medium transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" /> Ajouter
          </button>
        </div>

        {/* Teams List */}
        <div className="space-y-4 mb-8">
          {activeTournament.teams.length === 0 && (
            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              Aucune équipe enregistrée
            </div>
          )}
          {activeTournament.teams.map(team => {
             const isExpanded = expandedTeamId === team.id;
             return (
              <div key={team.id} className={`bg-slate-50 rounded-xl border border-transparent transition-all overflow-hidden ${isExpanded ? 'bg-white shadow-md border-slate-200 ring-1 ring-slate-200' : 'hover:bg-white hover:border-slate-200'}`}>
                
                {/* Team Header Row */}
                <div 
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  onClick={() => toggleTeamExpand(team.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isExpanded ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-500'}`}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 text-lg">{team.name}</span>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {team.players.length} joueur{team.players.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleRemoveTeam(team.id); }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Supprimer l'équipe"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Expanded Player Section */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-slate-100 bg-white">
                    <div className="mt-4 mb-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Effectif</h4>
                      
                      {/* Player List */}
                      {team.players.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2 mb-4">
                          {team.players.map(player => (
                            <div key={player.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 px-3 py-3 rounded-lg border border-slate-100">
                              <div className="flex items-center mb-2 sm:mb-0">
                                <User size={16} className="text-slate-400 mr-2" />
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-slate-700">{player.name}</span>
                                  <span className="text-xs text-indigo-500 font-medium">{player.position}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-4">
                                {/* Points Scored Control */}
                                <div className="flex items-center bg-white rounded-lg border border-slate-200 px-2 py-1 shadow-sm">
                                  <span className="text-xs text-slate-400 mr-2 uppercase tracking-tight">Pts</span>
                                  <button 
                                    onClick={() => handleUpdatePlayerPoints(team.id, player.id, -1)}
                                    className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
                                  >-</button>
                                  <span className="w-8 text-center text-sm font-bold text-slate-800">{player.pointsScored}</span>
                                  <button 
                                    onClick={() => handleUpdatePlayerPoints(team.id, player.id, 1)}
                                    className="w-5 h-5 flex items-center justify-center rounded bg-indigo-100 text-indigo-600 hover:bg-indigo-200 text-xs font-bold"
                                  >+</button>
                                </div>

                                <button 
                                  onClick={() => handleRemovePlayer(team.id, player.id)}
                                  className="text-slate-300 hover:text-red-500 transition-colors"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic mb-4">Aucun joueur dans cette équipe.</p>
                      )}

                      {/* Add Player Input */}
                      <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <select
                          value={inputPlayerPosition}
                          onChange={(e) => setInputPlayerPosition(e.target.value)}
                          className="w-full sm:w-auto px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white"
                        >
                          {POSITIONS.map(pos => (
                            <option key={pos} value={pos}>{pos}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={inputPlayerName}
                          onChange={(e) => setInputPlayerName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer(team.id)}
                          placeholder="Nom du joueur"
                          className="flex-1 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 transition-colors bg-white"
                        />
                        <button 
                          onClick={() => handleAddPlayer(team.id)}
                          disabled={!inputPlayerName.trim()}
                          className="w-full sm:w-auto bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <UserPlus size={16} className="mr-1" /> Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
             );
          })}
        </div>

        <button
          onClick={handleGenerateSchedule}
          disabled={activeTournament.teams.length < 2 || isGenerating}
          className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]
            ${activeTournament.teams.length < 2 || isGenerating ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700'}
          `}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center">
              <Sparkles className="animate-spin mr-2" /> Génération du calendrier...
            </span>
          ) : (
            "Générer le Calendrier"
          )}
        </button>
      </div>
    </div>
    );
  };

  const renderMatches = () => {
    if (!activeTournament) return null;
    return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Calendrier des Matchs</h2>
        <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
          {activeTournament.matches.length} matchs programmés
        </div>
      </div>

      {activeTournament.matches.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-medium text-slate-600">Aucun match prévu</h3>
          <p className="text-slate-400 mt-2">Allez dans "Équipes" pour générer un tournoi.</p>
          <button 
            onClick={() => setView(ViewState.SETUP)}
            className="mt-6 text-indigo-600 font-semibold hover:text-indigo-800"
          >
            Configurer maintenant &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {activeTournament.matches.map(match => (
            <MatchCard key={match.id} match={match} onUpdateMatch={handleMatchUpdate} />
          ))}
        </div>
      )}
    </div>
    );
  };

  // --- Main Render (Layout Switching) ---

  // 1. Tournament List View
  if (!activeTournamentId) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
        <div className="bg-indigo-900 text-white p-4 flex items-center justify-center shadow-lg">
          <Activity className="mr-2" />
          <h1 className="font-bold text-xl tracking-tight">VolleyMaster</h1>
        </div>
        {renderTournamentList()}
      </div>
    );
  }

  // 2. Main App View (Dashboard/Inside Tournament)
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900 font-sans">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="font-bold text-xl tracking-tight">VolleyMaster</div>
        <button className="text-white"><Menu /></button>
      </div>

      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-72 bg-indigo-900 text-white p-6 sticky top-0 h-screen shadow-2xl z-40">
        <div className="mb-10 flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTournamentId(null)}>
          <div className="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
             <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight leading-none">VolleyMaster</h1>
            <span className="text-xs text-indigo-300 font-medium tracking-wider uppercase">Manager</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
           <button 
            onClick={() => setActiveTournamentId(null)}
            className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all text-indigo-200 hover:bg-indigo-800 hover:text-white mb-6"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Mes Tournois</span>
          </button>

          <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest px-4 mb-2 mt-2">Navigation</div>

          <button 
            onClick={() => setView(ViewState.DASHBOARD)}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${view === ViewState.DASHBOARD ? 'bg-indigo-800 text-white shadow-inner' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}
          >
            <LayoutGrid size={20} />
            <span className="font-medium">Tableau de bord</span>
          </button>

          <button 
            onClick={() => setView(ViewState.RANKINGS)}
            className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${view === ViewState.RANKINGS ? 'bg-indigo-800 text-white shadow-inner' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}
          >
            <Medal size={20} />
            <span className="font-medium">Classements</span>
          </button>
          
          <button 
             onClick={() => setView(ViewState.MATCHES)}
             className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${view === ViewState.MATCHES ? 'bg-indigo-800 text-white shadow-inner' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}
          >
            <Calendar size={20} />
            <span className="font-medium">Matchs & Scores</span>
          </button>

          <button 
             onClick={() => setView(ViewState.SETUP)}
             className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${view === ViewState.SETUP ? 'bg-indigo-800 text-white shadow-inner' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}
          >
            <Users size={20} />
            <span className="font-medium">Équipes</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen scrollbar-hide">
        {/* Top bar (Desktop) */}
        <div className="hidden md:flex justify-between items-center mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3">
             {isEditingTitle ? (
               <div className="flex items-center space-x-2">
                 <input 
                  autoFocus
                  type="text" 
                  value={editedTitle} 
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleRenameTournament}
                  onKeyDown={(e) => e.key === 'Enter' && handleRenameTournament()}
                  className="text-xl font-bold text-slate-800 border-b-2 border-indigo-500 focus:outline-none px-1"
                 />
                 <button onClick={handleRenameTournament} className="text-indigo-600 hover:text-indigo-800"><CheckCircle size={20}/></button>
               </div>
             ) : (
                <div className="flex items-center group cursor-pointer" onClick={() => { setEditedTitle(activeTournament?.name || ''); setIsEditingTitle(true); }}>
                  <h2 className="text-xl font-bold text-slate-800 mr-2 group-hover:text-indigo-600 transition-colors">
                    {activeTournament?.name}
                  </h2>
                  <Edit2 size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
             )}
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="px-4 py-2 bg-indigo-50 rounded-full text-sm font-medium text-indigo-700">
               {view === ViewState.DASHBOARD && 'Vue d\'ensemble'}
               {view === ViewState.RANKINGS && 'Classements'}
               {view === ViewState.MATCHES && 'Calendrier'}
               {view === ViewState.SETUP && 'Configuration'}
             </div>
          </div>
        </div>

        {/* Content Views */}
        <div className="max-w-6xl mx-auto">
          {view === ViewState.DASHBOARD && renderDashboard()}
          {view === ViewState.RANKINGS && renderRankings()}
          {view === ViewState.MATCHES && renderMatches()}
          {view === ViewState.SETUP && renderSetup()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
        <button onClick={() => setView(ViewState.DASHBOARD)} className={`${view === ViewState.DASHBOARD ? 'text-indigo-600' : 'text-slate-400'}`}><LayoutGrid size={24} /></button>
        <button onClick={() => setView(ViewState.RANKINGS)} className={`${view === ViewState.RANKINGS ? 'text-indigo-600' : 'text-slate-400'}`}><Medal size={24} /></button>
        <button onClick={() => setView(ViewState.MATCHES)} className={`${view === ViewState.MATCHES ? 'text-indigo-600' : 'text-slate-400'}`}><Calendar size={24} /></button>
        <button onClick={() => setView(ViewState.SETUP)} className={`${view === ViewState.SETUP ? 'text-indigo-600' : 'text-slate-400'}`}><Users size={24} /></button>
      </div>

    </div>
  );
};

// Helper for Edit icon
const CheckCircle = ({ size, className }: { size: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

export default App;