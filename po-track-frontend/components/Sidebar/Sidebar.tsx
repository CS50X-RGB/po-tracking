"use client";

import { Button, Card, Link, User } from "@heroui/react";
import {
  House,
  UserRoundPen,
  ReceiptText as PurchaseOrder,
  BadgeQuestionMark as Permissions,
  HardDriveUpload as MasterData,
  Codesandbox as Logo,
  Cog as Partnumber,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  user: any;
  buttonHandler: any;
  chipGroups: {
    user: any[];
    purchase: any[];
    master: any[];
    other: any[];
    part: any[];
  };
}
export default function Sidebar({
  user,
  buttonHandler,
  chipGroups,
}: SidebarProps) {
  const permissionChip = chipGroups.other.find((chip) =>
    chip.name.toLowerCase().includes("permission"),
  );

  const dashboardChip = chipGroups.other.find((chip) =>
    chip.name.toLowerCase().includes("dashboard"),
  );

  return (
    <>
      <Card className="fixed top-0 left-0 flex flex-col h-screen items-center z-10 p-2 justify-between overflow-visible ">
        <div className="flex flex-col mx-auto space-y-2 items-center justify-center">
          <Logo size={56} color="#3e9392" className="text-center" />
          <h1 className="text-sm font-bold">PO-Tracking</h1>
        </div>

        <div className="flex flex-col mx-auto space-y-8  justify-evenly relative">
          {/* Home (no submenu) */}
          {dashboardChip && (
            <Link
              href={dashboardChip.link}
              className="flex flex-row text-sm font-bold items-center text-white"
            >
              <p>Home</p>
              <House className="cursor-pointer hover:text-[#3e9392]" />
            </Link>
          )}

          {/* User icon with submenu */}
          <div className="relative group">
            <div className="flex flex-row items-center gap-2">
              <p className="text-sm">User</p>
              <UserRoundPen className="cursor-pointer hover:text-[#3e9392]" />
            </div>
            <Card className="w-60 absolute left-full top-1/2 -translate-y-1/2  hidden group-hover:flex flex-col text-black shadow-lg rounded p-2 z-50 border-2 border-[#3e9392]">
              {chipGroups.user.map((chip, i) => (
                <div key={i}>
                  <Link
                    key={i}
                    href={chip.link}
                    className="hover:underline text-sm px-2 py-1 text-white"
                  >
                    {chip.name}
                  </Link>

                  {i < chipGroups.user.length - 1 && (
                    <div className="border-t border-white opacity-30 my-1" />
                  )}
                </div>
              ))}
            </Card>
          </div>

          {/* PurchaseOrder icon with submenu */}
          <div className="relative group">
            <div className="flex flex-row items-center gap-2">
              <p className="text-sm">PO</p>
              <PurchaseOrder className="cursor-pointer hover:text-[#3e9392]" />
            </div>
            <Card className="w-52 absolute left-full top-1/2 -translate-y-1/2  hidden group-hover:flex flex-col text-black shadow-lg rounded p-2 z-50 border-2 border-[#3e9392]">
              {chipGroups.purchase.map((chip, i) => (
                <div key={i}>
                  <Link
                    href={chip.link}
                    className="hover:underline text-sm px-2 py-1 text-white block"
                  >
                    {chip.name}
                  </Link>
                  {i < chipGroups.purchase.length - 1 && (
                    <div className="border-t border-white opacity-30 my-1" />
                  )}
                </div>
              ))}
            </Card>
          </div>
          {chipGroups.part.length > 0 && (
            <div className="relative group">
              {/* Partnumber icon with submenu */}
              <div className="flex flex-row gap-2 items-center">
                <p className="text-[16px]">PartNo</p>
                <Partnumber className="cursor-pointer hover:text-[#3e9392]" />
              </div>
              <Card className="w-52 absolute left-full top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col text-black shadow-lg rounded p-2 z-50 border-2 border-[#3e9392]">
                {chipGroups.part.map((chip, i) => (
                  <div key={i}>
                    <Link
                      href={chip.link}
                      className="hover:underline text-sm px-2 py-1 text-white"
                    >
                      {chip.name}
                    </Link>
                    {i < chipGroups.part.length - 1 && (
                      <div className="border-t border-white opacity-30 my-1" />
                    )}
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* MasterData icon with submenu */}
          {chipGroups.master.length > 0 && (
            <div className="relative group">
              <div className="flex flex-row items-cen gap-2 items-center">
                <p>Master Data</p>
                <MasterData className="cursor-pointer hover:text-[#3e9392]" />
              </div>
              <Card className="w-52 absolute left-full top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col text-black shadow-lg rounded p-2 z-50 border-2 border-[#3e9392]">
                {chipGroups.master.map((chip, i) => (
                  <div key={i}>
                    <Link
                      href={chip.link}
                      className="hover:underline text-sm px-2 py-1 text-white"
                    >
                      {chip.name}
                    </Link>

                    {i < chipGroups.master.length - 1 && (
                      <div className="border-t border-white opacity-30 my-1" />
                    )}
                  </div>
                ))}
              </Card>
            </div>
          )}

          {permissionChip && (
            <Link href={permissionChip.link} className="text-white">
              <p>Permissions</p>
              <Permissions className="cursor-pointer hover:text-[#3e9392]" />
            </Link>
          )}
        </div>
        <div className="flex flex-col space-y-2">
          <User
            className="flex flex-col text-wrap"
            avatarProps={{
              src: "https://avatars.githubusercontent.com/u/30373425?v=4",
            }}
            // description={
            //   <Link href="" className="text-xs">
            //     {user.email}
            //   </Link>
            // }
            name={user.name}
          />
          <Button onPress={buttonHandler} className="flex items-center gap-2">
            <LogOut color="red" size={24} />
          </Button>
        </div>
      </Card>
    </>
  );
}
