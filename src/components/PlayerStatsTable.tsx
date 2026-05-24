import type { PlayerStatLine, TeamBoxScore } from '@/lib/espnClient';

import { PlayerHeadshot } from './PlayerHeadshot';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

type PlayerStatsTableProps = {
  team: TeamBoxScore;
};

function formatPlusMinus(value: number | null): string {
  if (value === null) return '';
  if (value > 0) return `+${value}`;
  return String(value);
}

function PlayerRow({ player }: { player: PlayerStatLine }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <PlayerHeadshot src={player.headshot} name={player.name} size="sm" />
          <span className="font-medium">{player.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums">{player.minutes}</TableCell>
      <TableCell className="text-right tabular-nums">{player.points}</TableCell>
      <TableCell className="text-right tabular-nums">{player.rebounds}</TableCell>
      <TableCell className="text-right tabular-nums">{player.assists}</TableCell>
      <TableCell className="text-right tabular-nums">{player.fieldGoals}</TableCell>
      <TableCell className="text-right tabular-nums">{player.threePointers}</TableCell>
      <TableCell className="text-right tabular-nums">{player.freeThrows}</TableCell>
      <TableCell className="text-right tabular-nums">{formatPlusMinus(player.plusMinus)}</TableCell>
    </TableRow>
  );
}

export function PlayerStatsTable({ team }: PlayerStatsTableProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold">{team.displayName}</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">MIN</TableHead>
            <TableHead className="text-right">PTS</TableHead>
            <TableHead className="text-right">REB</TableHead>
            <TableHead className="text-right">AST</TableHead>
            <TableHead className="text-right">FG</TableHead>
            <TableHead className="text-right">3P</TableHead>
            <TableHead className="text-right">FT</TableHead>
            <TableHead className="text-right">+/−</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {team.players.map((player) => (
            <PlayerRow key={player.playerId || player.name} player={player} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
