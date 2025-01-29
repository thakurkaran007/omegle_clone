"use client";
import { getUser } from '@/hooks/getUser';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@repo/ui/src/components/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/src/components/avatar';
import { FaUser } from 'react-icons/fa';
import { ExitIcon } from '@radix-ui/react-icons';
import { signOut } from 'next-auth/react';

const UserButton = () => {
    const user = getUser();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <Avatar>
                    <AvatarImage src={user?.image || ""} />
                    <AvatarFallback className='bg-sky-300 h-full w-full rounded'>
                        <FaUser />
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
                <DropdownMenuContent className='flex space-x-0 items-center'>
                    <div className="flex items-center justify-center space-x-0 hover: cursor-pointer z-50" onClick={() => signOut()}>
                            <ExitIcon className='w-4 h-4 mr-2'/>
                            <div>Logout</div>
                    </div>
                </DropdownMenuContent>
        </DropdownMenu>
    )
}
export default UserButton;