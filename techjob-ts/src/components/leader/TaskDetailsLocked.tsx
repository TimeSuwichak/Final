  "use client";

  import React, { useState } from 'react';
  import { Clock, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';

  interface Update {
    updatedBy: string;
    updatedAt: string;
    message: string;
    imageUrl?: string;
  }

  interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in-progress' | 'completed';
    imageUrl?: string;
    updates?: Update[];
  }

  interface TaskDetailsLockedProps {
    tasks: Task[];
    onTaskSelect?: (taskId: string) => void;
  }

  const StatusPill = ({ status, count }: { status: 'pending' | 'in-progress' | 'completed'; count: number }) => {
    const configs = {
      pending: {
        label: 'รอดำเนินการ',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-600',
        countColor: 'text-blue-600'
      },
      'in-progress': {
        label: 'กำลังทำ',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-600',
        countColor: 'text-orange-600'
      },
      completed: {
        label: 'เสร็จสิ้น',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
        textColor: 'text-green-600',
        countColor: 'text-green-600'
      }
    };

    const config = configs[status];

    return (
      <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-lg p-4 text-center`}>
        <p className={`text-sm ${config.textColor} font-medium mb-1`}>{config.label}</p>
        <p className={`text-4xl font-bold ${config.countColor}`}>{count}</p>
      </div>
    );
  };

  const TaskCard = ({ task, isExpanded, onToggle }: { task: Task; isExpanded: boolean; onToggle: () => void }) => {
    const statusConfig = {
      pending: { 
        icon: AlertCircle, 
        bgColor: 'bg-white', 
        borderColor: 'border-blue-200', 
        textColor: 'text-blue-600',
        headerBg: 'bg-blue-50',
        headerBorder: 'border-blue-200',
        expandedBg: 'bg-blue-50/30'
      },
      'in-progress': { 
        icon: Clock, 
        bgColor: 'bg-white', 
        borderColor: 'border-orange-200', 
        textColor: 'text-orange-600',
        headerBg: 'bg-orange-50',
        headerBorder: 'border-orange-200',
        expandedBg: 'bg-orange-50/30'
      },
      
      completed: { 
        icon: CheckCircle2, 
        bgColor: 'bg-white', 
        borderColor: 'border-green-200', 
        textColor: 'text-green-600',
        headerBg: 'bg-green-50',
        headerBorder: 'border-green-200',
        expandedBg: 'bg-green-50/30'
      }
    };

    const config = statusConfig[task.status];
    const IconComponent = config.icon;

    return (
      <div className={`${config.bgColor} border ${config.borderColor} rounded-lg overflow-hidden`}>
        <button
          onClick={onToggle}
          className="w-full text-left p-3 hover:bg-opacity-80 transition-colors flex items-center gap-2"
        >
          <IconComponent className={`h-4 w-4 ${config.textColor} shrink-0`} />
          <span className="text-sm font-medium text-gray-800 flex-1 line-clamp-1">{task.title}</span>
          <ChevronRight className={`h-4 w-4 ${config.textColor} shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>

        {isExpanded && (
          <div className={`${config.expandedBg} border-t ${config.borderColor} p-3 space-y-3`}>
            {task.description && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">รายละเอียด</p>
                <p className="text-xs text-gray-600 leading-relaxed">{task.description}</p>
              </div>
            )}

            {task.imageUrl && (
              <div className="rounded overflow-hidden border border-gray-200">
                <img
                  src={task.imageUrl || "/placeholder.svg"}
                  alt="task"
                  className="w-full h-auto max-h-40 object-cover"
                />
              </div>
            )}

            {task.updates && task.updates.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">ประวัติการแก้ไข ({task.updates.length})</p>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {task.updates.map((update, idx) => (
                    <div key={idx} className="p-2 bg-white/70 rounded text-xs border border-gray-200">
                      <div className="flex items-start gap-2 mb-1">
                        <span className="font-medium text-gray-700">{update.updatedBy}</span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(update.updatedAt).toLocaleString('th-TH')}
                        </span>
                      </div>
                      <p className="text-gray-600">{update.message}</p>
                      {update.imageUrl && (
                        <img 
                          src={update.imageUrl || "/placeholder.svg"} 
                          alt="update" 
                          className="w-full h-auto max-h-24 object-cover rounded mt-2"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  export const TaskDetailsLocked: React.FC<TaskDetailsLockedProps> = ({ tasks }) => {
    const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    const handleTaskToggle = (taskId: string) => {
      // Accordion behavior: ถ้าคลิก task ที่ expand อยู่แล้วให้ collapse, ถ้าไม่ใช่ให้ expand task ใหม่
      setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
    };

    return (
      <div className="space-y-6">
        {/* Status Summary Pills */}
        <div className="grid grid-cols-3 gap-4">
          <StatusPill status="pending" count={pendingTasks.length} />
          <StatusPill status="in-progress" count={inProgressTasks.length} />
          <StatusPill status="completed" count={completedTasks.length} />
        </div>

        {/* Task Blocks - เรียงจากบนลงล่าง */}
        <div className="space-y-4">
          {/* Pending Tasks Block */}
          {pendingTasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                รอดำเนินการ ({pendingTasks.length})
              </h3> 
              <div className="grid space-y-1 gap-3">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex-shrink-0 min-w-[200px] flex-1 max-w-[310px]">
                    <TaskCard
                      task={task}
                      isExpanded={expandedTaskId === task.id}
                      onToggle={() => handleTaskToggle(task.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* In-Progress Tasks Block */}
          {inProgressTasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                กำลังทำ ({inProgressTasks.length})
              </h3>
              <div className=" grid space-y-1 gap-3">
                {inProgressTasks.map((task) => (
                  <div key={task.id} className="flex-shrink-0 min-w-[200px] flex-1 max-w-[310px]">
                    <TaskCard
                      task={task}
                      isExpanded={expandedTaskId === task.id}
                      onToggle={() => handleTaskToggle(task.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          

          {/* Completed Tasks Block */}
          {completedTasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-green-700 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                เสร็จสิ้น ({completedTasks.length})
              </h3>
              <div className=" flex flex-wrap gap-3">
                {completedTasks.map((task) => (
                  <div key={task.id} className="flex-shrink-0 min-w-[200px] flex-1 max-w-[300px]">
                    <TaskCard
                      task={task}
                      isExpanded={expandedTaskId === task.id}
                      onToggle={() => handleTaskToggle(task.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">ยังไม่มีงานย่อยในโครงการนี้</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  export default TaskDetailsLocked;

