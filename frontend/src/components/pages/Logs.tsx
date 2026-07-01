import { useState } from "react";
import LogSearchFilter from "../displays/LogSearchFilter";
import LogTable from "../displays/logTable/LogTable";

const timeFilterList = ["last hour", "last 24 hours", "last 7 days"];


export default function Logs() {
  const [textFilter, setTextFilter] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<string>('last hour');

    return (
        <div className="h-full w-full flex flex-col gap-12">
            <LogSearchFilter  value={textFilter} onChange={setTextFilter} timeFilter={timeFilter} setTimeFilter={setTimeFilter} timeFilterList={timeFilterList}/>
            <LogTable />
        </div>
    )
}