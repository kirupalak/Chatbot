import React, { useEffect, useRef, useState } from "react";
import {
  GanttComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
} from "@syncfusion/ej2-react-gantt";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { registerLicense } from "@syncfusion/ej2-base";
import { Tooltip } from "@syncfusion/ej2-popups";
// import { DataManager, Query } from '@syncfusion/ej2-data';
import "@syncfusion/ej2-grids/styles/material.css";
import "@syncfusion/ej2-gantt/styles/material.css";
import "@syncfusion/ej2-layouts/styles/material.css";
import "@syncfusion/ej2-treegrid/styles/material.css";
import "./index.css";
import { tab } from "@testing-library/user-event/dist/tab";

// Register the license key
registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1NDaF5cWWtCf1FpQXxbf1x0ZFJMZFhbR3ZPMyBoS35RckRiWXted3BRRWJYWEBx",
);
var data2 = [];

var kf = window.kf;
var account_id, uid;
export function Timeline() {
  const [timelineSettings, setTimelineSettings] = useState({
    timelineViewMode: "Month",
  });

  let ganttInstance;
  const taskFields = {
    id: "ID",
    name: "Retailer",
    startDate: "StartDate",
    endDate: "EndDate",
    Start_Date: "Start_Date",
    End_Date: "End_Date",
    // duration: 'Duration',
    status: "Status",
    sla: "SLABreached",
    // progress: 'Progress',
    child: "subtasks",
    expandState: "isExpand",
    baselineStartDate: "BaselineStartDate", // Add this
    baselineEndDate: "BaselineEndDate",
  };
  const dayWorkingTime = [{ from: 0, to: 24 }];

  const modes = [
    { item: "Hour", id: "1" },
    { item: "Day", id: "2" },
    { item: "Week", id: "3" },
    { item: "Month", id: "4" },
    { item: "Year", id: "5" },
  ];
  const colIds = {
    UID: "Column_wF9Q6byBEi",
    Retailer: "Column_SSa_b2PQ__",
    Region: "Column_zS4P2BcvMr",
    Country: "Column_AgSSlOFcA0",
    Stage: "Column_TtzHrwyC1o",
    Step: "Column_mk5gmIPs5p",
    "Start date": "Column_33mvc1biXm",
    "Expected end date": "Column_UbScPYgpNT",
    "Actual end date": "Column_L4HAHfMlJF",
    // "Duration" : "Column_8KAV7oOrm2",
    Status: "Column_1ZxN-hHBJ7",
    "Is SLA breached": "Column_0Sl2OH20xv",
  };

  const child_start_date = useRef([]);
  const parent_start_date = useRef([]);
  const grandChildArrRef = useRef([]);
  const childArrRef = useRef([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportData();
    console.log("---in useEffect---");
    console.log("Task Fields:", taskFields);
  }, []);

  const getReportData = async () => {
    var kf = window.kf;

    let uidArr = [];
    let stageArr = [];
    let parentArr = [];
    let childArr = [];
    let grandChildArr = [];

    let child = {};
    let parent = {};

    try {
      uid = await kf.app.page.getParameter("uid");

      console.log("page parameter, uid = ", uid);
      // let uid = 'RDON-0143';

      account_id = await kf.account._id;
      let dataCountResp = await kf.api(
        `/analytics/2/${account_id}/ds_Timeline_view_tier_1_A00/report/Timeline_report_tier_1_A00/count?$uid=${uid}`,
      );
      let dataCount = dataCountResp.Count;
      // console.log("dataCount = ",dataCount);
      let iterationCount = Math.ceil(dataCount / 100);
      // console.log("iterationCount = ",iterationCount);

      for (let page_no = 1; page_no <= iterationCount; page_no++) {
        console.log("page_no = ", page_no);
        kf.api(
          `/analytics/2/${account_id}/ds_Timeline_view_tier_1_A00/report/Timeline_report_tier_1_A00?page_number=${page_no}&page_size=100&_application_id=NielsenIQ_A00&$uid=${uid}`,
        ).then((reportResp) => {
          console.log("reportResp = ", reportResp);

          if (reportResp && reportResp.Data.length > 0) {
            let reportRespData = reportResp.Data;
            let last_uid = "";
            let last_retailer = "";
            let last_stage = "";
            let last_step = "";
            let last_status = "";
            let last_sla_status;
            let child_index = -1;
            let grandChild_index = 0;

            reportRespData.map((item) => {
              let uid = item[colIds["UID"]];
              let stage = item[colIds["Stage"]];

              if (!uidArr.includes(uid)) {
                uidArr.push(uid);

                last_uid = "";
                last_retailer = "";
                last_stage = "";
                last_step = "";

                parent_start_date.current.push(item[colIds["Start date"]]);
                // console.log("parent_start_date.current = ",parent_start_date.current);

                let last_parent_start_date = parent_start_date.current[0];

                if (last_uid !== "") {
                  child_index = 0;
                  grandChild_index = 0;

                  parent = {
                    // ID: last_uid,
                    // ID: last_retailer,
                    ID: last_step,
                    Retailer: last_retailer,
                    // Stage: last_stage,
                    StartDate: Date(last_parent_start_date),
                    // EndDate: last_end_date,
                    Status: last_status,
                    SLABreached: last_sla_status,
                    isExpand: false,
                    subtasks: childArrRef.current,
                  };

                  // console.log("parent = ",parent);

                  parentArr.push(parent);
                  // parentArrRef.current.push(parent);

                  parent_start_date.current = parent_start_date.current[1];

                  // console.log("after removing 1st element, parent_start_date.current = ",parent_start_date.current);

                  childArrRef.current.push(childArr);
                }

                childArr = [];
              }

              if (!stageArr.includes(stage)) {
                stageArr = [];
                stageArr.push(stage);

                child_start_date.current.push(item[colIds["Start date"]]);
                // console.log("child_start_date.current = ",child_start_date.current);

                let last_child_start_date = child_start_date.current[0];

                if (last_uid !== "") {
                  child_index = child_index + 1;
                  grandChild_index = 0;

                  let child_id = "Stage-" + child_index;
                  // let child_end_date = last_child_start_date

                  child = {
                    // ID: last_uid + child_index,
                    // ID : child_index,
                    ID: child_id,
                    // ID: last_stage,
                    // ID: last_stage + "-" + child_index,
                    Retailer: last_retailer,
                    // Stage: last_stage,
                    StartDate: new Date(last_child_start_date),
                    // EndDate: last_end_date,
                    Status: last_status,
                    SLABreached: last_sla_status,
                    isExpand: false,
                    subtasks: grandChildArr,
                  };

                  // console.log("child = ",child);

                  childArr.push(child);

                  child_start_date.current = [child_start_date.current[1]];

                  // console.log("after removing 1st element, child_start_date.current = ",child_start_date.current);

                  grandChildArrRef.current.push(grandChildArr);
                }
                grandChildArr = [];
              } else {
              }

              let end_date =
                item[colIds["Status"]] == "InProgress"
                  ? new Date(item[colIds["Expected end date"]])
                  : new Date(item[colIds["Actual end date"]]);

              last_uid = item[colIds["UID"]];
              last_retailer = item[colIds["Retailer"]];
              last_stage = item[colIds["Stage-"]];
              last_step = item[colIds["Step"]];
              last_status = item[colIds["Status"]];
              // last_end_date = end_date;

              grandChild_index = grandChild_index + 1;

              let grandChild = {
                // ID: last_uid + item[colIds['UID']],
                // ID: grandChild_index,
                ID: item[colIds["Step"]],
                Retailer: item[colIds["Retailer"]],
                // Stage: item[colIds['Stage-']],
                StartDate: new Date(item[colIds["Start date"]]),
                EndDate: end_date,
                // ExpectedEndDate: new Date(item[colIds['Expected end date']]),
                // ActualEndDate: new Date(item[colIds['Actual end date']]),
                Status: item[colIds["Status"]],
                // SLABreached: item[colIds['Is SLA breached']] = null ? 'No' : 'Yes',
                SLABreached:
                  item[colIds["Expected end date"]] >=
                  item[colIds["Actual end date"]]
                    ? "false"
                    : "true",
                // Progress: item[colIds['Status']] = 'Completed' ? 100 : 0
              };

              grandChildArr.push(grandChild);
              // console.log("grandChild = ",grandChild);
              // grandChildArrRef.current.push(grandChild);
            });

            // console.log("grandChildArr = ",grandChildArr);
            // grandChildArrRef.current.push(grandChildArr);

            child_index = child_index + 1;
            let child_id = "Stage-" + child_index;

            child = {
              // ID: last_uid + "-" + child_index,
              // ID: child_index,
              // ID: last_stage,
              // ID: last_stage + "-" + child_index,
              // ID: 'Stage-'+ child_index,
              ID: child_id,
              Retailer: last_retailer,
              // Stage: last_stage,
              StartDate: new Date(child_start_date.current[0]),
              // EndDate: last_end_date,
              Status: last_status,
              SLABreached: last_sla_status,
              isExpand: false,
              subtasks: grandChildArr,
            };

            // console.log("child = ",child);
            childArr.push(child);
            // childArrRef.current.push(child);

            parent = {
              ID: last_uid,
              // ID: last_retailer,
              Retailer: last_retailer,
              // Stage: last_stage,
              StartDate: new Date(parent_start_date.current[0]),
              // EndDate: last_end_date,
              Status: last_status,
              SLABreached: last_sla_status,
              isExpand: false,
              subtasks: childArr,
            };

            // console.log("parent = ",parent);

            parentArr.push(parent);
            // console.log("parentArr = ",parentArr);

            // data.current = parentArr;

            let mappedData = parentArr.map((item, index) => ({
              ID: item.ID,
              // ID: index+1,
              name: item.Retailer,
              startDate: new Date(item.StartDate),
              subtasks: item.subtasks,
              expandState: item.isExpand,
            }));

            console.log("inside function, mappedData = ", mappedData);
            setData(mappedData);
          }
        });
      }
    } catch {
      console.error("Error in api calling");
    }
  };
  console.log("outside", data);
  useEffect(() => {
    const fetchData = async () => {
      var kf = window.kf;
      setLoading(true);
      try {
        const ret = data[0].name;
        const account_id = await kf.account._id;

        const getOptionsDevelopment = {
          method: "GET",
          headers: {
            "X-Access-Key-ID": "Ak230ae72f-0df5-424c-97c2-5b15b2ca0cd1",
            "X-Access-Key-Secret":
              "khQUYG-mQBBNHvJW0OyZN1DkpAFZoxa3jidRFCcWnK2gXzSqqG3hdoqQu5qhFhEevTLdYRBSO0FDRea2tqew",
            "Content-Type": "application/json",
          },
        };

        const getOptionsProduction = {
          method: "GET",
          headers: {
            "X-Access-Key-ID": "Akc07c2229-3b6e-4e51-ae18-da13b0622fa5",
            "X-Access-Key-Secret":
              "80RCUP3qzdmDAiXNOTnd-3wlcEBcZP-mntxj1JC7EfEQzRUfpDr7QHNQ36NtC5cpmWoYzR7u6nCV7akF9BMw",
            "Content-Type": "application/json",
          },
        };

        const getOptionsUat = {
          method: "GET",
          headers: {
            "X-Access-Key-ID": "Ak816a5b7a-9f4d-4458-ae05-d000f00f90b0",
            "X-Access-Key-Secret":
              "Zp2T-q9TfCNWkmlfgwh9w5u5rXqaT9RNmWDS1D4eful2l69CGJNX5sVofGpWh1aag7SLXVdobltJHnTZQ6FGw",
            "Content-Type": "application/json",
          },
        };

        let options;

        if (account_id === "Ac7uSrXkUG7w") {
          options = getOptionsProduction;
        } else if (account_id === "Ac7uSs2PiyzA") {
          options = getOptionsDevelopment;
        } else {
          options = getOptionsUat;
        }
        function normalizeString(str) {
          return str.replace(/[-]/g, " ").toLowerCase();
        }

        var itemResp, stage, row, steps, step, Stages;
        const allItemsApi = `/process/2/${account_id}/admin/Retailer_Onboarding_Demo_A00/item?page_number=1&page_size=1000`;
        const resp1 = kf.api(allItemsApi, options);
        const allItemsResp = await resp1;

        const Data = allItemsResp.Data;

        for (let j = 0; j < Data.length; j++) {
          if (Data[j].UID2 === uid) {
            console.log("inside for");
            const itemApi = `/process/2/${account_id}/admin/Retailer_Onboarding_Demo_A00/${Data[j]._id}`;
            const resp3 = kf.api(itemApi, options);
            itemResp = await resp3;
            break;
          }
        }

        const tableData = itemResp["Table::Table_for_Timeline_Component"];
        if (tableData) {
          for (var i = 0; i < tableData.length; i++) {
            stage = [];
            row = tableData[i];
            Stages = data[0].subtasks;
            stage = Stages.filter(
              (subtask) =>
                normalizeString(subtask.ID) === normalizeString(row.Process),
            );
            if (stage[0]) {
              console.log(stage[0].ID);
              if (
                normalizeString(stage[0].ID) == normalizeString(row.Process)
              ) {
                if (stage.length > 0) {
                  const steps = stage[0].subtasks;

                  for (var j = i; j < tableData.length; j++) {
                    i = j;
                    if (
                      normalizeString(tableData[j].Process) ==
                      normalizeString(stage[0].ID)
                    ) {
                      step = steps.filter((s) => s.ID === tableData[j].Step);
                      if (step[0]) {
                        if (step[0].ID == tableData[j].Step) {
                          step.forEach((item) => {
                            item.BaselineStartDate = new Date(
                              tableData[j].Expected_Start
                                ? tableData[j].Expected_Start
                                : item.StartDate,
                            );
                            item.BaselineEndDate = new Date(
                              tableData[j].Expected_End,
                            );
                            item.SLABreached =
                              tableData[j].Is_SLA_breached == "Yes"
                                ? true
                                : false;
                            // item.Duration = 0;
                            item.SLA = tableData[j].SLA / 24;
                            if (item.Status != "Completed") {
                              item.Start_Date = new Date(item.StartDate);
                              item.End_Date = new Date(
                                tableData[j].Expected_End,
                              );
                              item.StartDate = new Date(item.StartDate);
                              item.EndDate = new Date(
                                tableData[j].Expected_End,
                              );
                            } else {
                              item.Start_Date = new Date(item.StartDate);
                              item.End_Date = new Date(item.EndDate);
                              item.StartDate = new Date(item.StartDate);
                              item.EndDate = new Date(item.EndDate);
                            }
                          });
                        }
                      } else {
                        if (
                          !tableData[j].Step.startsWith("Goto") &&
                          !tableData[j].Step.startsWith("Waiting")
                        ) {
                          const newStep = {
                            ID: tableData[j].Step,
                            Retailer: ret,
                            StartDate: new Date(tableData[j].Expected_Start),
                            EndDate: null,
                            Start_Date: new Date(tableData[j].Expected_Start),
                            End_Date: null,
                            SLA: tableData[j].SLA / 24,
                            // Duration: 0,
                            Status: "Not Started",
                            SLABreached:
                              tableData[j].Is_SLA_breached == "Yes"
                                ? true
                                : false,
                            BaselineStartDate: new Date(
                              tableData[j].Expected_Start,
                            ),
                            BaselineEndDate: new Date(
                              tableData[j].Expected_End,
                            ),
                          };
                          steps.push(newStep);
                        }
                      }
                    } else {
                      break;
                    }
                  }
                }
              }
            } else {
              const newStage = {
                ID: row.Process.replace("Stage ", "Stage-"),
                Retailer: ret,
                Status: "Not Started",
                isExpand: false,
                subtasks: [],
              };
              data[0].subtasks.push(newStage);
              if (
                !tableData[j].Step.startsWith("Goto") &&
                !tableData[j].Step.startsWith("Waiting")
              ) {
                const newStep = {
                  ID: tableData[j].Step,
                  Retailer: ret,
                  StartDate: new Date(tableData[j].Expected_Start),
                  EndDate: null,
                  Start_Date: new Date(tableData[j].Expected_Start),
                  End_Date: null,
                  SLA: tableData[j].SLA / 24,
                  // Duration: 0,
                  Status: "Not Started",
                  SLABreached:
                    tableData[j].Is_SLA_breached == "Yes" ? true : false,
                  BaselineStartDate: new Date(tableData[j].Expected_Start),
                  BaselineEndDate: new Date(tableData[j].Expected_End),
                };
                newStage.subtasks.push(newStep);
              }
            }
          }

          Stages = data[0].subtasks;
          Stages.forEach((stage) => {
            // stage.Duration = 0;
            const startDates = stage.subtasks.map(
              (subtask) => subtask.BaselineStartDate,
            );
            const slaTotal = stage.subtasks
              .map((subtask) => subtask.SLA)
              .reduce((total, sla) => total + sla, 0);
            const allSLAsReached = stage.subtasks.every(
              (subtask) => subtask.SLABreached,
            );
            const baselineStartDate = new Date(Math.min(...startDates));
            const endDates = stage.subtasks.map(
              (subtask) => subtask.BaselineEndDate,
            );
            const baselineEndDate = new Date(Math.max(...endDates));
            stage.BaselineStartDate = baselineStartDate;
            stage.BaselineEndDate = baselineEndDate;
            stage.SLA = slaTotal;
            stage.SLABreached = allSLAsReached;
          });
          Stages = data[0].subtasks;
          Stages.forEach((stage) => {
            // stage.Duration = 0;
            const startDates = stage.subtasks.map(
              (subtask) => subtask.Start_Date,
            );
            const baselineStartDate = new Date(Math.min(...startDates));
            const endDates = stage.subtasks.map((subtask) => subtask.End_Date);
            const hasNullEndDate = stage.subtasks.some(
              (subtask) => subtask.End_Date === null,
            );
            const baselineEndDate = new Date(Math.max(...endDates));
            stage.Start_Date = new Date(baselineStartDate);
            if (stage.Status != "Not Started") {
              if (hasNullEndDate) {
                stage.End_Date = stage.BaselineEndDate;
                stage.EndDate = stage.BaselineEndDate;
              } else {
                stage.End_Date = new Date(baselineEndDate);
              }
            } else {
              stage.End_Date = null;
            }
          });
        }
        data2 = data;
        setData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    console.log("Data state on update:", data);

    fetchData();
  }, [data]);

  const handleQueryTaskbarInfo = (args) => {
    if (args.data.Status === "Completed") {
      if (args.data.SLABreached === true) {
        args.taskbarElement.setAttribute("data-status", "delayed-completed");
      } else {
        args.taskbarElement.setAttribute("data-status", "completed");
      }
    } else if (args.data.Status === "InProgress") {
      if (args.data.SLABreached === true) {
        args.taskbarElement.setAttribute("data-status", "delayed-inProgress");
      } else {
        args.taskbarElement.setAttribute("data-status", "inProgress");
      }
    } else if (args.data.Status === "Not started") {
      args.taskbarElement.setAttribute("data-status", "notStarted");
    } else if (args.data.Status === "Rejected") {
      args.taskbarElement.setAttribute("data-status", "Rejected");
    }
    if (args.data.Status === "Not Started") {
      args.taskbarBgColor = "white";
      args.taskbarBorderColor = "white";
      args.tooltip = "";
      args.data.End_Date = null;
    }
  };

  const fields = { text: "item", value: "id" };

  // function onChange(args) {
  // if(args.value==="1")
  // {
  // ganttInstance.timelineSettings.timelineViewMode="Hour";
  // }
  // else if(args.value==="2")
  // {
  // ganttInstance.timelineSettings.timelineViewMode="Day";
  // }
  // else if(args.value==="3")
  // {
  // ganttInstance.timelineSettings.timelineViewMode="Week";
  // }
  // else if(args.value==="4")
  // {
  // ganttInstance.timelineSettings.timelineViewMode="Month";
  // }
  // else if(args.value==="5")
  // {
  // ganttInstance.timelineSettings.timelineViewMode="Year";
  // }

  // }

  function onChange(args) {
    const selectedMode = modes.find((mode) => mode.id === args.value);
    if (selectedMode) {
      setTimelineSettings({ timelineViewMode: selectedMode.item });
    }
  }

  const onQueryCellInfo = (args) => {
    if (args.column.field === "ID") {
      const tooltip = new Tooltip({
        content: `ID: ${args.data.ID}`,
      });
      tooltip.appendTo(args.cell);
    }
  };

  const formatOption = { type: "date", format: "MM/dd/yyyy" };
  return (
    <div>
      <div key={data}>
        <div className="clsModeRow">
          <div className="clsHomeRowRight">
            <DropDownListComponent
              id="modes"
              placeholder="Select"
              dataSource={modes}
              fields={fields}
              value="4"
              change={onChange}
              width="150px"
            />
          </div>
          <div className="clsHomeRowRight">
            <div className="overallProgress-legend"></div>Overall progress
            <div className="inProgress-legend"></div>In progress-On track
            <div className="delayed-inProgress-legend"></div>In progress-Delayed
            <div className="completed-legend"></div>Completed-On time
            <div className="delayed-completed-legend"></div>Completed-Delayed
            <div className="rejected-legend"></div>Rejected
          </div>
        </div>

        <GanttComponent
          ref={(gantt) => (ganttInstance = gantt)}
          dataSource={data2}
          renderBaseline={true}
          baselineColor="#2D6DF6"
          taskFields={taskFields}
          height="550px"
          dayWorkingTime={dayWorkingTime}
          includeWeekend={true} // Include weekends
          enablePredecessorValidation={false}
          queryTaskbarInfo={handleQueryTaskbarInfo}
          // allowUnscheduledTasks={true}
          queryCellInfo={onQueryCellInfo}
          timelineSettings={timelineSettings}
        >
          <ColumnsDirective>
            <ColumnDirective
              field="ID"
              headerText="ID"
              width="150"
            ></ColumnDirective>
            <ColumnDirective
              field="Retailer"
              headerText="Retailer"
              width="150"
            ></ColumnDirective>
            <ColumnDirective
              field="BaselineStartDate"
              headerText="Expected Start Date"
              width="150"
              format={formatOption}
            ></ColumnDirective>
            <ColumnDirective
              field="BaselineEndDate"
              headerText="Expected End Date"
              width="150"
              format={formatOption}
            ></ColumnDirective>
            <ColumnDirective
              field="Start_Date"
              headerText="Start Date"
              width="150"
              format={formatOption}
            ></ColumnDirective>
            <ColumnDirective
              field="End_Date"
              headerText="End Date"
              width="150"
              format={formatOption}
            ></ColumnDirective>
            {/* <ColumnDirective field='StartDate' headerText='StartDate' width='150' format={formatOption}></ColumnDirective>
 <ColumnDirective field='EndDate' headerText='EndDate' width='150' format={formatOption}></ColumnDirective> */}
            <ColumnDirective
              field="SLA"
              headerText="SLA"
              width="100"
            ></ColumnDirective>
            <ColumnDirective
              field="Status"
              headerText="Status"
              width="150"
            ></ColumnDirective>
            <ColumnDirective
              field="SLABreached"
              headerText="Is SLA breached"
              width="150"
            ></ColumnDirective>
            {/* <ColumnDirective field='Progress' headerText='Progress' width='70'></ColumnDirective> */}
          </ColumnsDirective>
          <Inject services={[]} />
        </GanttComponent>
      </div>
    </div>
  );
}

export default Timeline;









import React,{ useEffect, useRef, useState } from 'react';
import { GanttComponent, ColumnsDirective, ColumnDirective, Inject } from '@syncfusion/ej2-react-gantt';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { registerLicense } from '@syncfusion/ej2-base';
import { Tooltip } from '@syncfusion/ej2-popups';
// import { DataManager, Query } from '@syncfusion/ej2-data';
import '@syncfusion/ej2-grids/styles/material.css';
import '@syncfusion/ej2-gantt/styles/material.css';
import '@syncfusion/ej2-layouts/styles/material.css';
import '@syncfusion/ej2-treegrid/styles/material.css';
import './index.css';
import { tab } from '@testing-library/user-event/dist/tab';

// Register the license key
registerLicense('Ngo9BigBOggjHTQxAR8/V1NDaF5cWWtCf1FpQXxbf1x0ZFJMZFhbR3ZPMyBoS35RckRiWXted3BRRWJYWEBx');
var data2=[];

var kf = window.kf;
var account_id, uid;
export function Timeline (){
  
  const [timelineSettings, setTimelineSettings] = useState({ timelineViewMode: 'Month' });

  let ganttInstance;
  const taskFields= {
    id: 'ID',
    name: 'Retailer',
    startDate: 'StartDate',
    endDate: 'EndDate',
    Start_Date : 'Start_Date',
    End_Date : 'End_Date',
    // duration: 'Duration',
    status: 'Status',
    sla: 'SLABreached',
    // progress: 'Progress',
    child: 'subtasks',
    expandState: 'isExpand',
    baselineStartDate: 'BaselineStartDate', // Add this
    baselineEndDate: 'BaselineEndDate', 
 };
 const dayWorkingTime = [{ from: 0, to: 24 }]; 

 const modes=[
    { item: "Hour", id:"1" },
    { item: "Day", id:"2" },
    { item: "Week", id:"3" },
    { item: "Month", id:"4" },
    { item: "Year", id:"5" }
  ];
  const colIds = { 
    "UID" : "Column_wF9Q6byBEi",
    "Retailer" : "Column_SSa_b2PQ__",
    "Region" : "Column_zS4P2BcvMr",
    "Country" : "Column_AgSSlOFcA0",
    "Stage" : "Column_TtzHrwyC1o",
    "Step" : "Column_mk5gmIPs5p",
    "Start date" : "Column_33mvc1biXm",
    "Expected end date" : "Column_UbScPYgpNT",
    "Actual end date" : "Column_L4HAHfMlJF",
    // "Duration" : "Column_8KAV7oOrm2",
    "Status" : "Column_1ZxN-hHBJ7",
    "Is SLA breached" : "Column_0Sl2OH20xv"
  };

  const child_start_date  = useRef([]);
  const parent_start_date = useRef([]);
  const grandChildArrRef = useRef([]);
  const childArrRef = useRef([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    getReportData();
    console.log("---in useEffect---")
    console.log("Task Fields:", taskFields);  

  }, [])
  
  const getReportData = async () => {
    var kf = window.kf;

    let uidArr = [];
    let stageArr = [];
    let parentArr = [];
    let childArr = [];
    let grandChildArr = [];

    let child = {};
    let parent = {};

    try{
       uid = await kf.app.page.getParameter('uid');
      
      console.log("page parameter, uid = ",uid);
      // let uid = 'RDON-0143';

       account_id = await kf.account._id;
      let dataCountResp = await kf.api(`/analytics/2/${account_id}/ds_Timeline_view_tier_1_A00/report/Timeline_report_tier_1_A00/count?$uid=${uid}`);
      let dataCount = dataCountResp.Count;
      // console.log("dataCount = ",dataCount);
      let iterationCount = Math.ceil(dataCount / 100);
      // console.log("iterationCount = ",iterationCount);

      for(let page_no = 1; page_no <= iterationCount; page_no++){
        console.log("page_no = ",page_no);
        kf.api(`/analytics/2/${account_id}/ds_Timeline_view_tier_1_A00/report/Timeline_report_tier_1_A00?page_number=${page_no}&page_size=100&_application_id=NielsenIQ_A00&$uid=${uid}`).then((reportResp) => {
          console.log("reportResp = ",reportResp);
    
          if(reportResp && reportResp.Data.length > 0){
            let reportRespData = reportResp.Data;
            let last_uid = '';
            let last_retailer = '';
            let last_stage = '';
            let last_step = '';
            let last_status = '';
            let last_sla_status;
            let child_index = -1;
            let grandChild_index = 0;
           
            reportRespData.map((item) => {
              let uid = item[colIds['UID']];
              let stage = item[colIds['Stage']];
  
              if (!uidArr.includes(uid)) {
                uidArr.push(uid);
  
                last_uid = ''; last_retailer = ''; last_stage = ''; last_step = '';
  
                parent_start_date.current.push(item[colIds['Start date']]);
                // console.log("parent_start_date.current = ",parent_start_date.current);
  
                let last_parent_start_date = parent_start_date.current[0];
  
                if(last_uid !== ''){
                  
                  child_index = 0;
                  grandChild_index = 0;
  
                  parent = {
                    // ID: last_uid,
                    // ID: last_retailer,
                    ID: last_step,
                    Retailer: last_retailer, 
                    // Stage: last_stage,
                    StartDate: 
                     Date(last_parent_start_date),
                    // EndDate: last_end_date,
                    Status: last_status,
                    SLABreached : last_sla_status,
                    isExpand: false,
                    subtasks: childArrRef.current
                  }
  
                  // console.log("parent = ",parent);
  
                  parentArr.push(parent);
                  // parentArrRef.current.push(parent);
  
                  parent_start_date.current = parent_start_date.current[1];
  
                  // console.log("after removing 1st element, parent_start_date.current = ",parent_start_date.current);
  
                  childArrRef.current.push(childArr);
                }
                
                childArr = [];
              }
  
              if(!stageArr.includes(stage)){
                stageArr = [];
                stageArr.push(stage);
  
                child_start_date.current.push(item[colIds['Start date']]);
                // console.log("child_start_date.current = ",child_start_date.current);
  
                let last_child_start_date = child_start_date.current[0];
  
                if(last_uid !== ''){
                  child_index = child_index + 1;
                  grandChild_index = 0;

                  let child_id = 'Stage-'+ child_index;
                  // let child_end_date = last_child_start_date
  
                  child = {
                    // ID: last_uid + child_index,
                    // ID : child_index,
                    ID: child_id,
                    // ID: last_stage,
                    // ID: last_stage + "-" + child_index,
                    Retailer: last_retailer, 
                    // Stage: last_stage,
                    StartDate: new Date(last_child_start_date),
                    // EndDate: last_end_date,
                    Status: last_status,
                    SLABreached : last_sla_status,
                    isExpand: false,
                    subtasks: grandChildArr
                  }
  
                  // console.log("child = ",child);
  
                  childArr.push(child);
  
                  child_start_date.current = [child_start_date.current[1]]
  
                  // console.log("after removing 1st element, child_start_date.current = ",child_start_date.current);
  
                  grandChildArrRef.current.push(grandChildArr);
  
                }
                grandChildArr = [];
                
              }
              else{
  
              }
  
              let end_date = item[colIds['Status']] == 'InProgress' ? new Date(item[colIds['Expected end date']]) : new Date(item[colIds['Actual end date']]);

              last_uid = item[colIds['UID']];
              last_retailer = item[colIds['Retailer']];
              last_stage = item[colIds['Stage-']];
              last_step = item[colIds['Step']];
              last_status = item[colIds['Status']];
              // last_end_date = end_date;
  
              grandChild_index = grandChild_index + 1;
  
              let grandChild = {
                  // ID: last_uid + item[colIds['UID']],
                  // ID: grandChild_index,
                  ID: item[colIds['Step']],
                  Retailer: item[colIds['Retailer']],
                  // Stage: item[colIds['Stage-']],
                  StartDate: new Date(item[colIds['Start date']]),
                  EndDate: end_date,
                  // ExpectedEndDate: new Date(item[colIds['Expected end date']]),
                  // ActualEndDate: new Date(item[colIds['Actual end date']]),
                  Status: item[colIds['Status']],
                  // SLABreached: item[colIds['Is SLA breached']] = null ? 'No' : 'Yes',
                  SLABreached: item[colIds['Expected end date']] >= item[colIds['Actual end date']] ? 'false' : 'true',
                  // Progress: item[colIds['Status']] = 'Completed' ? 100 : 0
              }
  
              grandChildArr.push(grandChild);
              // console.log("grandChild = ",grandChild);
              // grandChildArrRef.current.push(grandChild);  
            });
  
            // console.log("grandChildArr = ",grandChildArr);
            // grandChildArrRef.current.push(grandChildArr);
  
            child_index = child_index + 1;
            let child_id = 'Stage-'+ child_index;
  
            child = {
              // ID: last_uid + "-" + child_index,
              // ID: child_index,
              // ID: last_stage,
              // ID: last_stage + "-" + child_index,
              // ID: 'Stage-'+ child_index,
              ID: child_id,
              Retailer: last_retailer, 
              // Stage: last_stage,
              StartDate: new Date(child_start_date.current[0]),
              // EndDate: last_end_date,
              Status: last_status,
              SLABreached : last_sla_status,
              isExpand: false,
              subtasks: grandChildArr
            }
  
            // console.log("child = ",child);
            childArr.push(child);
            // childArrRef.current.push(child);
  
            parent = {
              ID: last_uid,
              // ID: last_retailer,
              Retailer: last_retailer, 
              // Stage: last_stage,
              StartDate: new Date(parent_start_date.current[0]),
              // EndDate: last_end_date,
              Status: last_status,
              SLABreached : last_sla_status,
              isExpand: false,
              subtasks: childArr
            }
  
            // console.log("parent = ",parent);
  
            parentArr.push(parent);
            // console.log("parentArr = ",parentArr);
  
            // data.current = parentArr;
  
            let mappedData = parentArr.map((item, index) => ({
              ID: item.ID,
              // ID: index+1,
              name: item.Retailer,
              startDate: new Date(item.StartDate),
              subtasks: item.subtasks,
              expandState: item.isExpand
            }));
  
            console.log("inside function, mappedData = ",mappedData);
            setData(mappedData);
          }
        });
      }
      
    }
    catch{
      console.error("Error in api calling");
    }
  };
console.log("outside",data);
  useEffect(() => {
    const fetchData = async () => {
      var kf = window.kf;
      setLoading(true); 
        try {
            const ret = data[0].name; 
            const account_id = await kf.account._id;

            const getOptionsDevelopment = {
                method: "GET",
                headers: {
                    "X-Access-Key-ID": "Ak230ae72f-0df5-424c-97c2-5b15b2ca0cd1",
                    "X-Access-Key-Secret": "khQUYG-mQBBNHvJW0OyZN1DkpAFZoxa3jidRFCcWnK2gXzSqqG3hdoqQu5qhFhEevTLdYRBSO0FDRea2tqew",
                    "Content-Type": "application/json"
                }
            };

            const getOptionsProduction = {
                method: "GET",
                headers: {
                    "X-Access-Key-ID": "Akc07c2229-3b6e-4e51-ae18-da13b0622fa5",
                    "X-Access-Key-Secret": "80RCUP3qzdmDAiXNOTnd-3wlcEBcZP-mntxj1JC7EfEQzRUfpDr7QHNQ36NtC5cpmWoYzR7u6nCV7akF9BMw",
                    "Content-Type": "application/json"
                }
            };

            const getOptionsUat = {
                method: "GET",
                headers: {
                    "X-Access-Key-ID": "Ak816a5b7a-9f4d-4458-ae05-d000f00f90b0",
                    "X-Access-Key-Secret": "Zp2T-q9TfCNWkmlfgwh9w5u5rXqaT9RNmWDS1D4eful2l69CGJNX5sVofGpWh1aag7SLXVdobltJHnTZQ6FGw",
                    "Content-Type": "application/json"
                }
            };

            let options;

            if (account_id === "Ac7uSrXkUG7w") {
                options = getOptionsProduction;
            } else if (account_id === "Ac7uSs2PiyzA") {
                options = getOptionsDevelopment;
            } else {
                options = getOptionsUat;
            }
            function normalizeString(str) {
              return str.replace(/[-]/g, ' ').toLowerCase();
          }
          

            var itemResp, stage, row, steps, step, Stages;
            const allItemsApi = `/process/2/${account_id}/admin/Retailer_Onboarding_Demo_A00/item?page_number=1&page_size=1000`;
            const resp1 = kf.api(allItemsApi, options);
            const allItemsResp = await resp1;
            
              const Data = allItemsResp.Data;
      
              for (let j = 0; j < Data.length; j++) {
                if (Data[j].UID2 === uid) {
                  console.log("inside for");
                  const itemApi = `/process/2/${account_id}/admin/Retailer_Onboarding_Demo_A00/${Data[j]._id}`;
                  const resp3 = kf.api(itemApi, options);
                  itemResp = await resp3;
                  break;
                }
              }
              const tableData = itemResp['Table::Table_for_Timeline_Component']
              if(tableData){
              for(var i=0;i<tableData.length;i++){
                stage = []
                row = tableData[i];
                Stages = data[0].subtasks;
                stage = Stages.filter(subtask=>
                  normalizeString(subtask.ID) === normalizeString(row.Process)
                  );
                  if (stage[0]) {
                  console.log("stage[0]",stage[0]);

                  var isCompleted = stage[0].Status;
                  const idsToCheck = ["RDON-0009", "RDON-00010","RDON-00011","RDON-00012","RDON-00013"];
                  // if(stage[0] && (isCompleted === "Completed" ||isCompleted === "Rejected" ) && idsToCheck.includes(data[0].ID)){
                  //   const  steps1 = stage[0].subtasks;
                  //   steps1.forEach(item => {

                  //   item.Start_Date = new Date(item.StartDate);
                  //   item.End_Date = new Date(item.EndDate);
                  //   item.StartDate = new Date(item.StartDate);
                  //   item.EndDate = new Date(item.EndDate);
                  //   item.SLA = Math.ceil(Math.abs(new Date(item.EndDate) - new Date(item.StartDate)) / (1000 * 60 * 60 * 24));
                  // });}
console.log("jhgfdxszdfgyhujkjjjjjjjjjjjjjjjjjjjjjjj");
                  if (stage[0] && (((isCompleted === "Completed" || isCompleted === "Rejected") && (!idsToCheck.includes(data[0].ID))) || ((isCompleted != "Completed" ||isCompleted != "Rejected") && (idsToCheck.includes(data[0].ID))))) {
                    console.log(stage[0].ID)
                if(normalizeString(stage[0].ID) == normalizeString(row.Process)){
                if (stage.length > 0) {
                const  steps = stage[0].subtasks;

                  for(var j=i;j<tableData.length;j++){
                    i=j;
                    if(normalizeString(tableData[j].Process) == normalizeString(stage[0].ID)){
                      
                         step = steps.filter(s=>
                          s.ID === tableData[j].Step
                          )
                      if(step[0]){

                        if(step[0].ID == tableData[j].Step){
                          step.forEach(item => {
                            item.BaselineStartDate = new Date(tableData[j].Expected_Start?tableData[j].Expected_Start:item.StartDate);
                            item.BaselineEndDate = new Date(tableData[j].Expected_End);
                            item.SLABreached = tableData[j].Is_SLA_breached == "Yes"?true:false;
                            // item.Duration = 0;
                            item.SLA = (tableData[j].SLA)/24;
                            if(item.Status!="Completed"){
                            item.Start_Date = new Date(item.StartDate);
                            item.End_Date = new Date(tableData[j].Expected_End);
                            item.StartDate = new Date(item.StartDate);
                            item.EndDate =new Date( tableData[j].Expected_End);
                          }
                          else{
                            item.Start_Date = new Date(item.StartDate);
                            item.End_Date = new Date(item.EndDate);
                            item.StartDate = new Date(item.StartDate);
                            item.EndDate = new Date(item.EndDate);
                          }
                            
                        });                      
                      }}
                        else{
                          console.log("table[j", tableData[j], j);
                          if (!tableData[j].Step.startsWith("Goto") && !tableData[j].Step.startsWith("Waiting")) {
                          const newStep = {
                            ID: tableData[j].Step,
                            Retailer: ret,
                            StartDate: new Date(tableData[j].Expected_Start),
                            EndDate: null,
                            Start_Date : new Date(tableData[j].Expected_Start),
                            End_Date : null,
                            SLA: (tableData[j].SLA)/24,
                            // Duration: 0,
                            Status: isCompleted === "Rejected"?"Rejected":"Not Started",
                            SLABreached: tableData[j].Is_SLA_breached == "Yes"?true:false,
                            BaselineStartDate : new Date(tableData[j].Expected_Start),
                            BaselineEndDate : new Date(tableData[j].Expected_End)
                        };
                        steps.push(newStep)
                        }
                    }}
                    else{break;
                    }
                    i=j;
                  }
  
                  }
                  }
                }
              }
                else{
                    const newStage = {
                      ID: row.Process.replace("Stage ", "Stage-"),
                      Retailer: ret,
                      Status: "Not Started",
                      isExpand : false,
                      subtasks: [],
                      
                  };
                  data[0].subtasks.push(newStage); 
                  console.log("table[jjjjjj", tableData[i],i);

                  if (!tableData[i].Step.startsWith("Goto") && !tableData[i].Step.startsWith("Waiting")) {
  
                  const newStep = {
                    ID: tableData[i].Step,
                    Retailer: ret,
                    StartDate: new Date(tableData[i].Expected_Start),
                    EndDate: null,
                    Start_Date : new Date(tableData[i].Expected_Start),
                    End_Date : null,
                    SLA: (tableData[i].SLA)/24,
                    // Duration: 0,
                    Status: "Not Started",
                    SLABreached: tableData[i].Is_SLA_breached == "Yes"?true:false,
                    BaselineStartDate : new Date(tableData[i].Expected_Start),
                    BaselineEndDate : new Date(tableData[i].Expected_End)
                };
                newStage.subtasks.push(newStep);
              }
                  }
                  }
                  
                  Stages = data[0].subtasks
                  Stages.forEach(stage => {
                    // stage.Duration = 0;
                    const startDates = stage.subtasks.map(subtask => subtask.BaselineStartDate);
                    const slaTotal = stage.subtasks.map(subtask => subtask.SLA).reduce((total, sla) => total + sla, 0);
                    const allSLAsReached = stage.subtasks.every(subtask => subtask.SLABreached);
                    const baselineStartDate = new Date(Math.min(...startDates));
                    const endDates = stage.subtasks.map(subtask => subtask.BaselineEndDate);
                    const baselineEndDate = new Date(Math.max(...endDates));
                    stage.BaselineStartDate = baselineStartDate;
                    stage.BaselineEndDate = baselineEndDate; 
                    stage.SLA = slaTotal; 
                    stage.SLABreached =  allSLAsReached;               
                  });
                  Stages = data[0].subtasks
                  Stages.forEach(stage => {
                    // stage.Duration = 0;
                    const startDates = stage.subtasks.map(subtask => subtask.Start_Date);
                    const baselineStartDate = new Date(Math.min(...startDates));
                    const endDates = stage.subtasks.map(subtask => subtask.End_Date);
                    const hasNullEndDate = stage.subtasks.some(subtask => subtask.End_Date === null);
                    const baselineEndDate = new Date(Math.max(...endDates));
                    stage.Start_Date = new Date(baselineStartDate);
                    if(stage.Status!="Not Started"){
                      if(hasNullEndDate){
                        stage.End_Date = stage.BaselineEndDate;
                        stage.EndDate = stage.BaselineEndDate; }
                        else{
                    stage.End_Date = new Date(baselineEndDate);
                  }  }  
                    else{
                      stage.End_Date = null;
                    }             
                  });
                 
                }
                  data2 = data;
                  setData(data);
  
          } catch (error) {
              console.error("Error fetching data:", error);
          }
          finally {
            setLoading(false); 
        }
      };
      console.log("Data state on update:", data);
  
      fetchData();
  }, [data]);
  
    
    const handleQueryTaskbarInfo = (args) => {
      if (args.data.Status === 'Completed') {
        if(args.data.SLABreached === true){
          args.taskbarElement.setAttribute('data-status', 'delayed-completed');
        } 
        else{
          args.taskbarElement.setAttribute('data-status', 'completed');
        }
      } 
      else if (args.data.Status === 'InProgress') {
        if(args.data.SLABreached === true){
          args.taskbarElement.setAttribute('data-status', 'delayed-inProgress');
        }
        else{
          args.taskbarElement.setAttribute('data-status', 'inProgress');
        }
      }
      else if (args.data.Status === 'Not started') {
        args.taskbarElement.setAttribute('data-status', 'notStarted');
      }
      else if (args.data.Status === 'Rejected') {
        args.taskbarElement.setAttribute('data-status', 'Rejected');
      }
      if (args.data.Status === 'Not Started') {
        args.taskbarBgColor = 'white'; 
        args.taskbarBorderColor = 'white';
        args.tooltip = ''; 
        args.data.End_Date = null; 
    }
    };  
  
    const fields={text:"item", value:"id"};
  
    // function onChange(args) {
    //   if(args.value==="1")
    //   {
    //     ganttInstance.timelineSettings.timelineViewMode="Hour";
    //   }
    //   else if(args.value==="2")
    //   {
    //     ganttInstance.timelineSettings.timelineViewMode="Day";
    //   }
    //   else if(args.value==="3")
    //   {
    //     ganttInstance.timelineSettings.timelineViewMode="Week";
    //   }
    //   else if(args.value==="4")
    //   {
    //     ganttInstance.timelineSettings.timelineViewMode="Month";
    //   }
    //   else if(args.value==="5")
    //   {
    //     ganttInstance.timelineSettings.timelineViewMode="Year";
    //   }
  
    // }
  
    function onChange(args) {
      const selectedMode = modes.find(mode => mode.id === args.value);
      if (selectedMode) {
        setTimelineSettings({ timelineViewMode: selectedMode.item });
      }
    }
  
  
    const onQueryCellInfo = (args) => {
      if (args.column.field === 'ID') {
          const tooltip = new Tooltip({
              content: `ID: ${args.data.ID}`
          });
          tooltip.appendTo(args.cell);
      }
    };
   

    const  formatOption = { type: 'date', format: 'MM/dd/yyyy' };
      return (
        <div>
          <div key={data}>
          <div className='clsModeRow'>
            <div className='clsHomeRowRight'>
              <DropDownListComponent 
                id="modes" 
                placeholder="Select" 
                dataSource={modes}
                fields={fields} 
                value="4"
                change={onChange} 
                width="150px"
              />
            </div>
            <div className='clsHomeRowRight'>
            <div className="overallProgress-legend"></div>Overall progress
              <div className="inProgress-legend"></div>In progress-On track
              <div className="delayed-inProgress-legend"></div>In progress-Delayed
              <div className="completed-legend"></div>Completed-On time
              <div className="delayed-completed-legend"></div>Completed-Delayed
              <div className="rejected-legend"></div>Rejected
            </div>
          </div>
          
          <GanttComponent 
            ref={gantt => ganttInstance =gantt}
            dataSource={data2} 
            renderBaseline={true}
            baselineColor='#2D6DF6'
            taskFields={taskFields}
            height = '550px'
            dayWorkingTime={dayWorkingTime}
            includeWeekend={true} // Include weekends
            enablePredecessorValidation={false}
            queryTaskbarInfo={handleQueryTaskbarInfo}
            // allowUnscheduledTasks={true}
            queryCellInfo={onQueryCellInfo}
            timelineSettings={timelineSettings}
          >   
            <ColumnsDirective>
              <ColumnDirective field='ID' headerText='ID' width='150'></ColumnDirective>
              <ColumnDirective field='Retailer' headerText='Retailer' width='150'></ColumnDirective>
              <ColumnDirective field='BaselineStartDate' headerText='Expected Start Date' width='150' format={formatOption}></ColumnDirective>
              <ColumnDirective field='BaselineEndDate' headerText='Expected End Date' width='150' format={formatOption}></ColumnDirective>
              <ColumnDirective field='Start_Date' headerText='Start Date' width='150' format={formatOption}></ColumnDirective>
              <ColumnDirective field='End_Date' headerText='End Date' width='150' format={formatOption}></ColumnDirective>
              {/* <ColumnDirective field='StartDate' headerText='StartDate' width='150' format={formatOption}></ColumnDirective>
              <ColumnDirective field='EndDate' headerText='EndDate' width='150' format={formatOption}></ColumnDirective> */}
              <ColumnDirective field='SLA' headerText='SLA' width='100'></ColumnDirective>
              <ColumnDirective field='Status' headerText='Status' width='150'></ColumnDirective>
              <ColumnDirective field='SLABreached' headerText='Is SLA breached' width='150'></ColumnDirective>
              {/* <ColumnDirective field='Progress' headerText='Progress' width='70'></ColumnDirective> */}
            </ColumnsDirective>
            <Inject services={[]} />
          </GanttComponent>     
          </div>  
        </div>
      );
  };
  
  export default Timeline;
  
  //crt
  