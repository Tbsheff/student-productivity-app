            <Button variant="outline" size="sm">
              Today
            </Button>
          </div>
        </div>

        <TabsContent value="month" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 border-b">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <div
                      key={day}
                      className="py-2 text-center text-sm font-medium"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>
              <div className="grid grid-cols-7 grid-rows-6 h-[600px]">
                {weeks.map((week, weekIndex) => (
                  <React.Fragment key={weekIndex}>
                    {week.map((day, dayIndex) => {
                      // Check if there are tasks due on this day
                      const dayTasks =
                        tasks?.filter((task) => {
                          const taskDate = new Date(task.due_date);
                          return (
                            taskDate.getDate() === day.date.getDate() &&
                            taskDate.getMonth() === day.date.getMonth() &&
                            taskDate.getFullYear() === day.date.getFullYear()
                          );
                        }) || [];

                      return (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={`border p-1 ${day.isCurrentMonth ? "bg-background" : "bg-muted/30 text-muted-foreground"} ${day.date.getDate() === today.getDate() && day.date.getMonth() === today.getMonth() ? "bg-indigo-50 dark:bg-indigo-950/20" : ""}`}
                        >
                          <div className="flex justify-between items-start">
                            <span
                              className={`text-sm ${day.date.getDate() === today.getDate() && day.date.getMonth() === today.getMonth() ? "font-bold text-indigo-600" : ""}`}
                            >
                              {day.day}
                            </span>
                            {dayTasks.length > 0 && (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-indigo-600 rounded-full">
                                {dayTasks.length}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                            {dayTasks.map((task) => (
                              <div
                                key={task.id}
                                className="text-xs p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded truncate"
                              >
                                {task.title}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <p className="text-muted-foreground">
                  Weekly view will be implemented soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <p className="text-muted-foreground">
                  Daily view will be implemented soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agenda" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {tasks && tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between space-x-4 rounded-md border p-3"
                    >
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.course || "No course"} · {task.priority}{" "}
                          priority
                        </p>
                      </div>
                      <div className="text-sm">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString()
                          : "No due date"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        No upcoming events
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CanvasIntegration />
        </div>

        <div className="lg:col-span-1">
          <GoogleCalendarSync />
        </div>

        <div className="lg:col-span-1">
          <IcsUpload />
        </div>
      </div>
    </DashboardShell>
  );
}
