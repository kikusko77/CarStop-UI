import { Button } from "primereact/button";
import Link from "next/link";

interface UpdateButtonProps {
    href: string;
    tooltip?: string;
    isSelected: boolean;
}

const UpdateButton = ({ href, tooltip, isSelected }: UpdateButtonProps) => {
    return (
        <div>
            {isSelected ? (
                <Link href={href} passHref>
                    <Button icon="pi pi-file-edit" rounded tooltip={tooltip} tooltipOptions={{ position: 'top' }} />
                </Link>
            ) : (
                <Button icon="pi pi-file-edit" rounded tooltip={tooltip} tooltipOptions={{ position: 'top' }}/>
            )}
        </div>
    );
};

export default UpdateButton;
