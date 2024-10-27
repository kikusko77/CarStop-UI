"use client";
import {useRef, useState} from "react";
import {DataTable, DataTableFilterMeta,} from "primereact/datatable";
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import {Vehicle} from "../../interfaces/VehicleCreate";
import {useVehicleContext} from "./providers/VehicleContext";
import {useDeleteVehicles} from "../../api/useVehicle";
import CreateButton from "./CreateButton"
import UpdateButton from "@/app/eloryks/components/UpdateButton";
import 'primeflex/primeflex.scss';
import {DateFormat} from "@/app/eloryks/components/DateFormat";
import {InputText} from "primereact/inputtext";
import {FilterMatchMode} from "primereact/api";
import {Toolbar} from "primereact/toolbar";
import {QueryClient, useQuery} from "@tanstack/react-query";
import {fetchVehicles} from "@/app/api/useVehicleSSR";
import {ConfirmDialog, confirmDialog} from "primereact/confirmdialog";
import {Toast} from "primereact/toast";
import {useSession} from "next-auth/react";
import {Message, useMessage} from "@/app/api/intl/IntlMessage";

interface SelectionChangeEvent {
    value: Vehicle[];
}

const VehicleDataTable = () => {
    const {selectedVehicles, setSelectedVehicles} = useVehicleContext();
    const deleteVehicles = useDeleteVehicles();
    const [Loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        StationId: {value: null, matchMode: FilterMatchMode.CONTAINS},
        StationType: {value: null, matchMode: FilterMatchMode.CONTAINS},
        'Position.Speed': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'Position.Heading': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'Position.Latitude': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'Position.Longitude': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'Position.Timestamp': {value: null, matchMode: FilterMatchMode.CONTAINS},
        CertificateId: {value: null, matchMode: FilterMatchMode.CONTAINS},
        'EncryptionKey.KeyType': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'EncryptionKey.CoordX': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'EncryptionKey.CoordY': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'SignKey.KeyType': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'SignKey.CoordX': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'SignKey.CoordY': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'SpeedLimit.Speed': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'SpeedLimit.EngineSpeed': {value: null, matchMode: FilterMatchMode.CONTAINS},
    });
    const searchById = useMessage({ value: "search.byId" })
    const createTooltip = useMessage({ value: "create.record" })
    const updateTooltip = useMessage({ value: "update.record" })
    const yesTooltip = useMessage({ value: "yes" })
    const noTooltip = useMessage({ value: "no" })
    const deleteTooltip = useMessage({ value: "delete.record" })
    const selectDeleteTooltip = useMessage({ value: "select.delete.record" })
    const deleteErrorTooltip = useMessage({ value: "delete.error" })
    const deleteConfirmationTooltip = useMessage({ value: "confirmed" })
    const deleteSuccessTooltip = useMessage({ value: "delete.success" })
    const deleteRejectedTooltip = useMessage({ value: "rejected" })
    const beforeDeleteTooltip = useMessage({ value: "delete.question" })
    const beforeDeleteTooltipConf = useMessage({ value: "delete.confirmation" })
    const refreshTooltip = useMessage({ value: "refresh" })
    const queryClient = new QueryClient()
    const session = useSession();
    // @ts-ignore
    const {data: vehicles, isLoading, error, refetch} = useQuery({
        queryKey: ['vehicles'],
        // @ts-ignore
        queryFn: () => fetchVehicles(session.data?.user.email, session.data?.user?.pwd),
    });
    function handleClick() {
        setLoading(true)
        queryClient.invalidateQueries({ queryKey: ['vehicles'] }).then(() => {refetch()
            .finally(() => setLoading(false));});
    }

    const toast = useRef<Toast>(null);
    const onSelectionChange = (e: SelectionChangeEvent) => {
        setSelectedVehicles(e.value);
    };

    const handleDelete = async () => {
        const idsToDelete = selectedVehicles.map(vehicle => vehicle.StationId);
        await deleteVehicles.mutateAsync(idsToDelete, {
            onSuccess: () => {
                setSelectedVehicles([]);
            },
            onError: (error) => {
                console.error("Error deleting vehicles:", error);
            },
        });
    };

    const timestampTemplate = (rowData: any) => {
        return <DateFormat value={rowData.Position?.Timestamp}/>;
    };

    const leftToolbarTemplate = () => (
            <div className="flex gap-2">
                <CreateButton href='/create' tooltip={createTooltip ? createTooltip : 'Create record'}/>
                <UpdateButton href='/update' isSelected={true} tooltip={updateTooltip ? updateTooltip : 'Update record'}/>
                <Button
                    onClick={confirm}
                    className="p-button-danger"
                    icon="pi pi-trash"
                    rounded
                    tooltip={selectedVehicles.length > 0 ? deleteTooltip : selectDeleteTooltip}
                    tooltipOptions={{position: 'top'}}
                />
            </div>
    )
    const rightToolbarTemplate = () => (
        <div className='flex gap-2'>
        <span className="p-input-icon-left">
          <i className="pi pi-search"/>
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder={searchById ? searchById : 'Search by ID'}/>
        </span>
            <Button onClick={() => handleClick()} icon='pi pi-refresh' rounded tooltip={refreshTooltip} tooltipOptions={{position: 'top'}}
            loading={Loading}></Button>
        </div>
    )

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = {
            ...filters,
            StationId: {value: value, matchMode: FilterMatchMode.EQUALS}
        };

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const accept = () => {
        handleDelete()
            .then(() => {
                toast.current?.show({
                    severity: 'info',
                    summary: deleteConfirmationTooltip,
                    detail: deleteSuccessTooltip,
                    life: 3000
                });
            })
            .catch((error) => {
                toast.current?.show({
                    severity: 'warn',
                    summary: deleteRejectedTooltip,
                    detail: deleteErrorTooltip + error.message,
                    life: 3000
                });
            });
    };

    const reject = () => {
    }

    const confirm = () => {
        if (selectedVehicles.length > 0) {
            confirmDialog({
                message: beforeDeleteTooltip,
                header: beforeDeleteTooltipConf,
                icon: 'pi pi-info-circle',
                defaultFocus: 'reject',
                acceptClassName: 'p-button-danger',
                acceptLabel: yesTooltip,
                rejectLabel: noTooltip,
                accept,
                reject
            });
        }

    };


    return (

        <>
            <Toast ref={toast}/>
            <ConfirmDialog/>
            <div className="grid">
                <div className="col-1"></div>
                <div className="col-10 justify-content-center">
                    <div className="card">
                        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                        <DataTable
                            value={vehicles}
                            selectionMode="checkbox"
                            selection={selectedVehicles}
                            onSelectionChange={onSelectionChange}
                            dataKey="StationId"
                            className="p-datatable"
                            showGridlines
                            stripedRows
                            rows={5}
                            paginator
                            rowsPerPageOptions={[5, 10, 15]}
                            size="small"
                            scrollable={true}
                            filters={filters}
                        >
                            <Column
                                selectionMode="multiple"
                                headerStyle={{width: "3rem"}}
                                frozen
                            ></Column>
                            <Column field="StationId" header={<Message>{"stationId"}</Message>} sortable className="font-bold" frozen/>
                            <Column field="StationType" header={<Message>{"stationType"}</Message>} sortable/>
                            <Column field="Position.Speed" header={<Message>{"speed"}</Message>} sortable/>
                            <Column field="Position.Heading" header={<Message>{"heading"}</Message>} sortable/>
                            <Column field="Position.Latitude" header={<Message>{"latitude"}</Message>} sortable/>
                            <Column field="Position.Longitude" header={<Message>{"longitude"}</Message>} sortable/>
                            <Column field="Position.Timestamp" header={<Message>{"timestamp"}</Message>} body={timestampTemplate} sortable/>
                            <Column field="CertificateId" header={<Message>{"certificateId"}</Message>} sortable/>
                            <Column field="EncryptionKey.KeyType" header={<Message>{"encryption.keyType"}</Message>} sortable/>
                            <Column field="EncryptionKey.CoordX" header={<Message>{"encryption.coordX"}</Message>} sortable/>
                            <Column field="EncryptionKey.CoordY" header={<Message>{"encryption.coordY"}</Message>} sortable/>
                            <Column field="SignKey.KeyType" header={<Message>{"signature.keyType"}</Message>} sortable/>
                            <Column field="SignKey.CoordX" header={<Message>{"signature.coordX"}</Message>} sortable/>
                            <Column field="SignKey.CoordY" header={<Message>{"signature.coordY"}</Message>} sortable/>
                            <Column field="SpeedLimit.Speed" header={<Message>{"speedLimit"}</Message>} sortable/>
                            <Column field="SpeedLimit.EngineSpeed" header={<Message>{"engineSpeed"}</Message>} sortable/>
                        </DataTable>
                    </div>
                </div>
                <div className="col-1"></div>
            </div>
        </>
    );
};

export default VehicleDataTable;

