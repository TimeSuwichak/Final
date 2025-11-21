import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck } from "lucide-react";
import { user as ALL_USERS } from "@/Data/user";
import { leader as ALL_LEADERS } from "@/Data/leader";

interface JobTeamDisplayProps {
  job: {
    leadId: string | null;
    assignedTechs: string[];
  };
}

export const JobTeamDisplay: React.FC<JobTeamDisplayProps> = ({ job }) => {
  const leader = useMemo(() => {
    if (!job.leadId) return null;
    // Try to find in leaders first, then users (fallback)
    const foundLeader = ALL_LEADERS.find(
      (u) => String(u.id) === String(job.leadId)
    );
    if (foundLeader) return foundLeader;

    return ALL_USERS.find((u) => String(u.id) === String(job.leadId));
  }, [job.leadId]);

  const technicians = useMemo(() => {
    return job.assignedTechs
      .map((id) => ALL_USERS.find((u) => String(u.id) === String(id)))
      .filter((u): u is (typeof ALL_USERS)[0] => u !== undefined);
  }, [job.assignedTechs]);

  const techsByDept = useMemo(() => {
    const groups: Record<string, (typeof ALL_USERS)[0][]> = {};
    technicians.forEach((t) => {
      const dept = t.department || "Unassigned";
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(t);
    });
    return groups;
  }, [technicians]);

  return (
    <div className="space-y-4">
      {/* Leader Section */}
      {leader && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <UserCheck className="h-3.5 w-3.5" /> หัวหน้าทีม
          </h4>
          <div className="flex items-center gap-3 p-3 bg-green-50/50 border border-green-100 rounded-lg w-fit min-w-[250px]">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarImage src={leader.avatarUrl} />
              <AvatarFallback className="bg-green-600 text-white">
                {leader.fname[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-green-900">
                  {leader.fname} {leader.lname}
                </p>
              </div>
              <p className="text-xs text-green-700">{leader.position}</p>
            </div>
          </div>
        </div>
      )}

      {/* Technicians Section */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <Users className="h-3.5 w-3.5" /> ทีมช่าง ({technicians.length})
        </h4>

        {Object.entries(techsByDept).length === 0 && (
          <p className="text-xs text-muted-foreground italic pl-1">
            ยังไม่มีช่างในทีม
          </p>
        )}

        {Object.entries(techsByDept).map(([dept, techs]) => (
          <div key={dept} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] font-normal bg-gray-50"
              >
                แผนก {dept}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {techs.map((tech) => (
                <div
                  key={tech.id}
                  className="flex items-center gap-3 p-2.5 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <Avatar className="h-9 w-9 border border-gray-100">
                    <AvatarImage src={tech.avatarUrl} />
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                      {tech.fname[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tech.fname} {tech.lname}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {tech.position}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
