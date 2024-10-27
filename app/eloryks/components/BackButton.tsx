import {Button} from "primereact/button";

interface Props {
    label: string;
    onClick: () => void;
}

const BackButton = ({label, onClick}: Props) => {
    return (
        <Button label={label} type="button" icon='pi pi-arrow-left' link onClick={onClick}
                className='mt-3 col-4 p-2 overflow-visible'/>
    );
};

export default BackButton;
