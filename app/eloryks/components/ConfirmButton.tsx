import {Button} from "primereact/button";

interface Props {
    label: string;
    onClick: () => void;
    loading: boolean
}

const ConfirmButton = ({label, onClick, loading}: Props) => {
    return (
        <Button label={label} type="submit" icon="pi pi-check" loading={loading} onClick={onClick}
                className='mt-3 col-2 p-2 w-fit md:w-2 lg:w-2 xl:w-2'/>
    );
};

export default ConfirmButton;
