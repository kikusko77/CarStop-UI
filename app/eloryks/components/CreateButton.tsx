import Link from "next/link";
import {Button} from "primereact/button";

interface CreateButtonProps {
    href: string;
    tooltip?: string;
}

const CreateButton = ({href, tooltip}: CreateButtonProps) => {
    return (
        <Link href={href} passHref>
            <Button icon="pi pi-plus" severity="success" tooltip={tooltip} rounded
                    tooltipOptions={{position: 'top'}}/>
        </Link>
    );
};

export default CreateButton;