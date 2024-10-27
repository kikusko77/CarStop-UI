import React from "react";
import {Button} from "primereact/button";

interface Props {
    label: string;
    onClick: () => void;
}

const ConfirmButton = ({label, onClick}: Props) => {
    return (
        <Button label={label} type="reset" severity="secondary" onClick={onClick} className='mt-3 mr-2 col-2 p-2'/>
    );
};

export default ConfirmButton;
