"use client";
import {useEffect, useState} from "react";
import {DataTable, DataTableFilterMeta,} from "primereact/datatable";
import {Column} from "primereact/column";
import 'primeflex/primeflex.scss';
import {DateFormat} from "@/app/eloryks/components/DateFormat";
import {FilterMatchMode} from "primereact/api";
import {ConfirmDialog} from "primereact/confirmdialog";
import {Message, useMessage} from "@/app/api/intl/IntlMessage";
import {useMqtt} from "@/app/eloryks/components/providers/MqttContext";
import {Cam} from "@/app/interfaces/Mqtt";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";
import {Toolbar} from "primereact/toolbar";
import L from "leaflet";

interface SelectionChangeEvent {
    value: Cam[];
}

const MqttDataTable = () => {
    const {
        camData, setCamData, processNearbyVehicles, selectedRecords,
        blockedVehicles, setSelectedRecords
    } = useMqtt();
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        stationID: {value: null, matchMode: FilterMatchMode.CONTAINS},
        stationType: {value: null, matchMode: FilterMatchMode.CONTAINS},
        acceleration: {value: null, matchMode: FilterMatchMode.CONTAINS},
        heading: {value: null, matchMode: FilterMatchMode.CONTAINS},
        latitude: {value: null, matchMode: FilterMatchMode.CONTAINS},
        longitude: {value: null, matchMode: FilterMatchMode.CONTAINS},
        secured: {value: null, matchMode: FilterMatchMode.CONTAINS},
        speed: {value: null, matchMode: FilterMatchMode.CONTAINS},
        timestamp: {value: null, matchMode: FilterMatchMode.CONTAINS},
        causeCode: {value: null, matchMode: FilterMatchMode.CONTAINS},
        local: {value: null, matchMode: FilterMatchMode.CONTAINS},
        subCauseCode: {value: null, matchMode: FilterMatchMode.CONTAINS},
        text: {value: null, matchMode: FilterMatchMode.CONTAINS},
    });
    const searchById = useMessage({value: "search.byId"})
    const vehicleBlocked = useMessage({value: "vehicle.vehicleBlocked"})
    const vehicleNotBlocked = useMessage({value: "vehicle.vehicleNotBlocked"})
    const clearTimeNumber = Number(process.env.NEXT_PUBLIC_CAM_DATA_CLEAN_UP_IN_MILLIS)

    const timestampTemplate = (rowData: any) => {
        const date = new Date(convertToMillis(rowData.timestamp));
        return <DateFormat value={date}/>;
    };

    function convertToMillis(input: number): number {
        return input < 10000000000 ? input * 1000 : input;
    }

    const cleanupOldData = () => {
        const now = Date.now();
        const fifteenMinutesAgo = now - clearTimeNumber;
        const updatedData = camData?.filter(item => new Date(item.timestamp).getTime() > fifteenMinutesAgo);
        setCamData(updatedData);
        localStorage.setItem('camData', JSON.stringify(updatedData));
        localStorage.setItem('lastCleanup', now.toString());
    };

    useEffect(() => {
        const lastCleanup = parseInt(localStorage.getItem('lastCleanup') || '0');
        const now = Date.now();
        const timeSinceLastCleanup = now - lastCleanup;
        const timeToNextCleanup = clearTimeNumber - timeSinceLastCleanup;

        const intervalId = setInterval(cleanupOldData, clearTimeNumber);
        if (timeSinceLastCleanup > clearTimeNumber) {
            cleanupOldData();
        } else {
            setTimeout(cleanupOldData, timeToNextCleanup);
        }
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const onSelectionChange = (e: SelectionChangeEvent) => {
        setSelectedRecords(e.value);
    };

    const leftToolbarTemplate = () => (
        <div className="flex gap-2">
            <Button
                onClick={() => processNearbyVehicles('STOP')}
                className="p-button-danger">
                <Message>{'vehicle.stop'}</Message>
            </Button>
            <Button
                onClick={() => processNearbyVehicles('UNBLOCK')}
                severity="success"
            >
                <Message>{'vehicle.unBlock'}</Message>
            </Button>
            <Button
                onClick={() => processNearbyVehicles('PERIODIC_SENDING')}
                className="p-button-info p-button-block"
            >
                <Message>{'vehicle.stopPeriodicSending'}</Message>
            </Button>
        </div>
    )
    const rightToolbarTemplate = () => (
        <div className='flex gap-2'>
        <span className="p-input-icon-left">
          <i className="pi pi-search"/>
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange}
                       placeholder={searchById ? searchById : 'Search by ID'}/>
        </span>
        </div>
    )

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = {
            ...filters,
            stationID: {value: value, matchMode: FilterMatchMode.EQUALS}
        };

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const StopIcon = L.icon({
        iconUrl: '/eloryks/stopIcon.png',
        iconSize: [3, 4],
        iconAnchor: [20, 55],
        popupAnchor: [0, -55]
    });

    const StopIconComponent = () => {
        return(
            <div className="icon-stop-icon-datatable-container">
                <img src={StopIcon.options.iconUrl} alt="icon" className="icon-stop-icon-datatable" />
            </div>
        )
    };

    const checkIfBlocked = (rowData: any) => {
        if(blockedVehicles.has(rowData.stationID)) {
            return <StopIconComponent/>;
            //return vehicleBlocked;
        } else {
            return vehicleNotBlocked;
        }
    };

    return (
        <>
            <ConfirmDialog/>
            <div className="grid">
                <div className="col-1"></div>
                <div className="col-10 justify-content-center">
                    <div className="card">
                        <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>
                        <DataTable
                            value={camData.filter(selected => selected.stationType !== 15)}
                            selectionMode="checkbox"
                            selection={selectedRecords}
                            onSelectionChange={onSelectionChange}
                            dataKey="stationID"
                            className="p-datatable"
                            showGridlines
                            stripedRows
                            columnResizeMode='fit'
                            rows={5}
                            paginator
                            rowsPerPageOptions={[5, 10, 15]}
                            size="small"
                            scrollable={true}
                            filters={filters}
                        >
                            <Column
                                selectionMode="multiple"
                                headerStyle={{width: "4rem"}}
                                frozen
                            ></Column>
                            <Column field="blocked" header={<Message>{"blocked"}</Message>} body={checkIfBlocked} className="font-bold" frozen/>
                            <Column field="stationID" header={<Message>{"stationId"}</Message>} sortable
                                    className="font-bold" frozen/>
                            <Column field="stationType" header={<Message>{"stationType"}</Message>} sortable/>
                            <Column field="acceleration" header={<Message>{"acceleration"}</Message>} sortable/>
                            <Column field="heading" header={<Message>{"heading"}</Message>} sortable/>
                            <Column field="latitude" header={<Message>{"latitude"}</Message>} sortable/>
                            <Column field="longitude" header={<Message>{"longitude"}</Message>} sortable/>
                            <Column field="secured" header={<Message>{"secured"}</Message>} sortable/>
                            <Column field="speed" header={<Message>{"speed"}</Message>} sortable/>
                            <Column field="timestamp" header={<Message>{"timestamp"}</Message>} body={timestampTemplate}
                                    sortable/>
                            <Column field="causeCode" header={<Message>{"causeCode"}</Message>} sortable/>
                            <Column field="local" header={<Message>{"local"}</Message>} sortable/>
                            <Column field="subCauseCode" header={<Message>{"subCauseCode"}</Message>} sortable/>
                            <Column field="text" header={<Message>{"text"}</Message>} sortable/>
                        </DataTable>
                    </div>
                </div>
                <div className="col-1"></div>
            </div>
        </>
    );
};

export default MqttDataTable;
