import NotificationIcon from "../assets/buttons/notification.svg?react";
import ProfileIcon from "../assets/buttons/profile.svg?react";
import RefreshIcon from "../assets/buttons/refresh.svg?react";

export default function Topbar({title}: { title: String}) {
    return (
        <aside className="h-[76px] w-full bg-primary flex justify-start px-8">
            <div className="w-1/2 h-full flex justify-start items-center">
                <h1 className="h-fit w-1/2 text-[14px] text-t3 font-bold font-inter uppercase">{title}</h1>
            </div>
            <div className="w-1/2 h-full flex justify-end items-center gap-6">
                <div className="h-full flex justify-end items-center gap-4">
                    <button className="h-fit w-fit p-2 items-center justify-center">
                        <NotificationIcon className="h-5 w-5 text-t1" />
                    </button>   
                    <button className="h-fit w-fit p-2 items-center justify-center">
                        <ProfileIcon className="h-5 w-5 text-t1" />
                    </button>   
                </div>
                <button className="h-fit w-fit p-2 px-4 py-1 rounded bg-dodgerBlue">
                    <div className="px-4 py-1 items-center justify-center flex gap-1">
                        <RefreshIcon className="h-3 w-3 text-[#002957]" />
                        <span className="text-[14px] text-[#002957] font-space font-bold">Force Sync</span>
                    </div>
                </button>
            </div>
        </aside>
            
    )
}