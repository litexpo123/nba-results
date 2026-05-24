import type { TeamBoxScore } from '@/lib/espnClient';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

type LineScoreProps = {
  teams: [TeamBoxScore, TeamBoxScore];
};

export function LineScore({ teams }: LineScoreProps) {
  const periodCount = Math.max(teams[0].linePeriods.length, teams[1].linePeriods.length);
  const periodLabels = Array.from({ length: periodCount }, (_, i) =>
    i < 4 ? String(i + 1) : `OT${i - 3}`,
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Team</TableHead>
          {periodLabels.map((label) => (
            <TableHead key={label} className="text-right tabular-nums">
              {label}
            </TableHead>
          ))}
          <TableHead className="text-right tabular-nums font-semibold">T</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.map((team) => (
          <TableRow key={team.abbreviation}>
            <TableCell className="font-medium">{team.abbreviation}</TableCell>
            {Array.from({ length: periodCount }, (_, i) => (
              <TableCell key={i} className="text-right tabular-nums">
                {team.linePeriods[i] ?? ''}
              </TableCell>
            ))}
            <TableCell className="text-right tabular-nums font-semibold">{team.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
