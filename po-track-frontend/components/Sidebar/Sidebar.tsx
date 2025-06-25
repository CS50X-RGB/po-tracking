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
      <Card className="fixed top-0 left-0 flex flex-col h-screen  z-10 p-2 justify-between overflow-visible ">
        <div className="flex flex-col mx-auto space-y-2 justify-center">
          <Logo size={56} color="#3e9392" className="text-center" />
          <h1 className="text-sm">PO-Tracking</h1>
        </div>

        <div className="flex flex-col mx-auto space-y-8  justify-evenly relative">
          {/* Home (no submenu) */}
          {dashboardChip && (
            <Link href={dashboardChip.link} className="text-white">
              <House className="cursor-pointer hover:text-[#3e9392]" />
            </Link>
          )}

          {/* User icon with submenu */}
          <div className="relative group">
            <UserRoundPen className="cursor-pointer hover:text-[#3e9392]" />
            <Card className="w-52 absolute left-full top-1/2 -translate-y-1/2  hidden group-hover:flex flex-col text-black shadow-lg rounded p-2 z-50 border-2 border-[#3e9392]">
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
            <PurchaseOrder className="cursor-pointer hover:text-[#3e9392]" />
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

          {/* Partnumber icon with submenu */}
          <div className="relative group">
            <Partnumber className="cursor-pointer hover:text-[#3e9392]" />
            <Card className="w-52 absolute left-full top-1/2 -translate-y-1/2  hidden group-hover:flex flex-col text-black shadow-lg rounded p-2 z-50 border-2 border-[#3e9392]">
              {chipGroups.part.map((chip, i) => (
                <div key={i}>
                  <Link
                    key={i}
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

          {/* MasterData icon with submenu */}
          <div className="relative group">
            <MasterData className="cursor-pointer hover:text-[#3e9392]" />
            <Card className="w-52 absolute left-full top-1/2 -translate-y-1/2  hidden group-hover:flex flex-col  text-black shadow-lg rounded p-2 z-50 border-2 border-[#3e9392]">
              {chipGroups.master.map((chip, i) => (
                <div key={i}>
                  <Link
                    key={i}
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

          {permissionChip && (
            <Link href={permissionChip.link} className="text-white">
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
            <LogOut size={24} />
          </Button>
        </div>
      </Card>
    </>
  );
}
