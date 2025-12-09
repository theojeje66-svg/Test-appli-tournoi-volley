import React, { useState } from 'react';
import { Match, SetScore } from '../types';
import { Trophy, ChevronDown, ChevronUp, Play, CheckCircle } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onUpdateMatch: (updatedMatch: Match) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onUpdateMatch }) => {
  const [expanded, setExpanded] = useState(match.status === 'LIVE');

  const updateScore = (team: 'A' | 'B', delta: number) => {
    if (match.status === 'FINISHED') return;

    const newSets = [...match.sets];
    const currentSetIndex = match.currentSet;
    const currentSet = newSets[currentSetIndex];

    if (team === 'A') {
      currentSet.teamA = Math.max(0, currentSet.teamA + delta);
    } else {
      currentSet.teamB = Math.max(0, currentSet.teamB + delta);
    }

    const updatedMatch: Match = {
      ...match,
      sets: newSets,
      status: match.status === 'SCHEDULED' ? 'LIVE' : match.status
    };
    onUpdateMatch(updatedMatch);
  };

  const finishSet = () => {
    if (match.status === 'FINISHED') return;
    
    // Config pour Best of 5 (3 sets gagnants)
    // Sets 1 à 4 en 25 points, Set 5 (Tie-break) en 15 points
    const isTieBreak = match.currentSet === 4;
    const limit = isTieBreak ? 15 : 25;
    
    const currentS = match.sets[match.currentSet];

    // Validation des points (Au moins 'limit' points et 2 points d'écart)
    if ((currentS.teamA < limit && currentS.teamB < limit) || Math.abs(currentS.teamA - currentS.teamB) < 2) {
      alert(`Le set n'est pas terminé. Il faut au moins ${limit} points et 2 points d'écart.`);
      return;
    }

    // Calculer les sets gagnés APRÈS ce set
    let setsWonA = 0;
    let setsWonB = 0;
    
    // On parcourt tous les sets actuels pour compter les victoires
    match.sets.forEach(s => {
      if (s.teamA > s.teamB) setsWonA++;
      else if (s.teamB > s.teamA) setsWonB++;
    });

    // Logique Best of 5 : Le match est fini si quelqu'un a 3 sets
    const matchFinished = setsWonA === 3 || setsWonB === 3;

    if (matchFinished) {
      onUpdateMatch({
        ...match,
        status: 'FINISHED',
        winnerId: setsWonA > setsWonB ? match.teamAId : match.teamBId
      });
    } else {
      // Démarrer le set suivant
      onUpdateMatch({
        ...match,
        sets: [...match.sets, { teamA: 0, teamB: 0 }],
        currentSet: match.currentSet + 1
      });
    }
  };

  const startMatch = () => {
    onUpdateMatch({ ...match, status: 'LIVE' });
    setExpanded(true);
  };

  const getSetScoreString = () => {
    return match.sets.map(s => `${s.teamA}-${s.teamB}`).join(', ');
  };

  const renderFinishedDetails = () => {
    const setsWonA = match.sets.filter(s => s.teamA > s.teamB).length;
    const setsWonB = match.sets.filter(s => s.teamB > s.teamA).length;

    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-center space-x-2 pb-2 border-b border-slate-100">
           <Trophy size={16} className="text-yellow-500" />
           <span className="text-sm font-medium text-slate-500">Vainqueur</span>
           <span className="text-base font-bold text-indigo-700">
             {match.winnerId === match.teamAId ? match.teamAName : match.teamBName}
           </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead>
              <tr className="text-slate-400 text-xs uppercase bg-slate-50">
                <th className="px-3 py-2 text-left rounded-l-md">Équipe</th>
                {match.sets.map((_, i) => (
                  <th key={i} className="px-3 py-2 whitespace-nowrap">Set {i + 1}</th>
                ))}
                <th className="px-3 py-2 font-bold rounded-r-md">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className={match.winnerId === match.teamAId ? 'bg-indigo-50/50' : ''}>
                <td className="px-3 py-3 text-left font-semibold text-slate-700">{match.teamAName}</td>
                {match.sets.map((s, i) => (
                  <td key={`a-${i}`} className={`px-3 py-2 ${s.teamA > s.teamB ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                    {s.teamA}
                  </td>
                ))}
                <td className="px-3 py-2 font-bold text-indigo-600">{setsWonA}</td>
              </tr>
              <tr className={match.winnerId === match.teamBId ? 'bg-indigo-50/50' : ''}>
                <td className="px-3 py-3 text-left font-semibold text-slate-700">{match.teamBName}</td>
                {match.sets.map((s, i) => (
                  <td key={`b-${i}`} className={`px-3 py-2 ${s.teamB > s.teamA ? 'font-bold text-slate-900' : 'text-slate-400'}`}>
                    {s.teamB}
                  </td>
                ))}
                <td className="px-3 py-2 font-bold text-indigo-600">{setsWonB}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 ${match.status === 'LIVE' ? 'ring-2 ring-indigo-500' : ''}`}>
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between cursor-pointer bg-slate-50 hover:bg-slate-100"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{match.round || 'Match'}</span>
          <div className="flex items-center space-x-4 mt-1">
            <span className={`font-bold ${match.winnerId === match.teamAId ? 'text-indigo-600' : 'text-slate-800'}`}>{match.teamAName}</span>
            <span className="text-slate-400 font-medium">vs</span>
            <span className={`font-bold ${match.winnerId === match.teamBId ? 'text-indigo-600' : 'text-slate-800'}`}>{match.teamBName}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {match.status === 'FINISHED' && (
             <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-sm font-medium">
               <CheckCircle size={14} className="mr-1"/> Terminé
             </div>
          )}
          {match.status === 'LIVE' && (
             <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded text-sm font-medium animate-pulse">
               <span className="w-2 h-2 bg-red-600 rounded-full mr-1"></span> En cours
             </div>
          )}
          {match.status !== 'SCHEDULED' && (
             <span className="text-lg font-mono font-bold text-slate-700 hidden sm:inline">{getSetScoreString()}</span>
          )}
          {expanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </div>
      </div>

      {/* Scoring Body */}
      {expanded && (
        <div className="p-4 border-t border-slate-200 bg-white">
          {match.status === 'SCHEDULED' ? (
            <div className="flex justify-center">
              <button 
                onClick={(e) => { e.stopPropagation(); startMatch(); }}
                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
              >
                <Play size={16} className="mr-2" /> Démarrer le match
              </button>
            </div>
          ) : match.status === 'FINISHED' ? (
             renderFinishedDetails()
          ) : (
            <div className="flex flex-col space-y-6">
               <div className="flex justify-between items-center px-2">
                 <div className="text-center w-1/3">
                    <div className="text-sm text-slate-500 mb-2">{match.teamAName}</div>
                    <div className="text-5xl font-bold text-indigo-900 mb-3">{match.sets[match.currentSet].teamA}</div>
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => updateScore('A', -1)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center">-</button>
                      <button onClick={() => updateScore('A', 1)} className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 flex items-center justify-center text-xl font-bold">+</button>
                    </div>
                 </div>

                 <div className="flex flex-col items-center justify-center w-1/3">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Set {match.currentSet + 1}</div>
                    <div className="text-2xl font-light text-slate-300">-</div>
                    <div className="text-xs text-slate-400 mt-2">Obj: {match.currentSet === 4 ? '15' : '25'} pts</div>
                 </div>

                 <div className="text-center w-1/3">
                    <div className="text-sm text-slate-500 mb-2">{match.teamBName}</div>
                    <div className="text-5xl font-bold text-indigo-900 mb-3">{match.sets[match.currentSet].teamB}</div>
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => updateScore('B', -1)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center">-</button>
                      <button onClick={() => updateScore('B', 1)} className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 flex items-center justify-center text-xl font-bold">+</button>
                    </div>
                 </div>
               </div>

               <div className="flex justify-center pt-2">
                 <button 
                  onClick={finishSet}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors shadow-lg shadow-slate-200"
                 >
                   Terminer le Set {match.currentSet + 1}
                 </button>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchCard;