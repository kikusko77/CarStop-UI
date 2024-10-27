"use client";
import {useRef, useState} from "react";
import {DataTable, DataTableFilterMeta,} from "primereact/datatable";
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import CreateButton from "./CreateButton"
import UpdateButton from "@/app/eloryks/components/UpdateButton";
import 'primeflex/primeflex.scss';
import {DateFormat} from "@/app/eloryks/components/DateFormat";
import {InputText} from "primereact/inputtext";
import {FilterMatchMode} from "primereact/api";
import {Toolbar} from "primereact/toolbar";
import {QueryClient, useQuery} from "@tanstack/react-query";
import {ConfirmDialog, confirmDialog} from "primereact/confirmdialog";
import {Toast} from "primereact/toast";
import {useSession} from "next-auth/react";
import {Message, useMessage} from "@/app/api/intl/IntlMessage";
import {MqttEvidence} from "@/app/interfaces/MqttEvidence";
import {useMqttEvidenceContext} from "@/app/eloryks/components/providers/MqttEvidenceContext";
import {fetchMqttEvidence} from "@/app/api/useMqttEvidenceSSR";
import {useDeleteMqttEvidence} from "@/app/api/useMqttEvidence";

interface SelectionChangeEvent {
    value: MqttEvidence[];
}

const MqttEvidenceDataTable = () => {
    const {selectedEvidences, setSelectedEvidences} = useMqttEvidenceContext();
    const deleteEvidences = useDeleteMqttEvidence();
    const [Loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        id: {value: null, matchMode: FilterMatchMode.CONTAINS},
        requestAuthorEmail: {value: null, matchMode: FilterMatchMode.CONTAINS},
        heading: {value: null, matchMode: FilterMatchMode.CONTAINS},
        latitude: {value: null, matchMode: FilterMatchMode.CONTAINS},
        longitude: {value: null, matchMode: FilterMatchMode.CONTAINS},
        local: {value: null, matchMode: FilterMatchMode.CONTAINS},
        secured: {value: null, matchMode: FilterMatchMode.CONTAINS},
        speed: {value: null, matchMode: FilterMatchMode.CONTAINS},
        stationId: {value: null, matchMode: FilterMatchMode.CONTAINS},
        stationType: {value: null, matchMode: FilterMatchMode.CONTAINS},
        timestamp: {value: null, matchMode: FilterMatchMode.CONTAINS},
    });
    const searchById = useMessage({value: "search.byId"})
    const createTooltip = useMessage({value: "create.record"})
    const updateTooltip = useMessage({value: "update.record"})
    const yesTooltip = useMessage({value: "yes"})
    const noTooltip = useMessage({value: "no"})
    const deleteTooltip = useMessage({value: "delete.record"})
    const selectDeleteTooltip = useMessage({value: "select.delete.record"})
    const deleteErrorTooltip = useMessage({value: "delete.error"})
    const deleteConfirmationTooltip = useMessage({value: "confirmed"})
    const deleteSuccessTooltip = useMessage({value: "delete.success"})
    const deleteRejectedTooltip = useMessage({value: "rejected"})
    const beforeDeleteTooltip = useMessage({value: "delete.question"})
    const beforeDeleteTooltipConf = useMessage({value: "delete.confirmation"})
    const refreshTooltip = useMessage({value: "refresh"})
    const queryClient = new QueryClient()
    const session = useSession();
    // @ts-ignore
    const {data: evidences, isLoading, error, refetch} = useQuery({
        queryKey: ['mqttEvidence'],
        // @ts-ignore
        queryFn: () => fetchMqttEvidence(session.data?.user.email, session.data?.user?.pwd),
    });

    function handleClick() {
        setLoading(true)
        queryClient.invalidateQueries({queryKey: ['mqttEvidence']}).then(() => {
            refetch()
                .finally(() => setLoading(false));
        });
    }

    const toast = useRef<Toast>(null);
    const onSelectionChange = (e: SelectionChangeEvent) => {
        setSelectedEvidences(e.value);
    };
    const handleDelete = async () => {
        const idsToDelete = selectedEvidences.map(evidence => evidence.id);
        const id = idsToDelete[0]
        await deleteEvidences.mutateAsync(id, {
            onSuccess: () => {
                setSelectedEvidences([]);
            },
            onError: (error) => {
                console.error("Error deleting vehicles:", error);
            },
        });
    };

    const timestampTemplate = (rowData: any) => {
        return <DateFormat value={rowData.timestamp}/>;
    };

    const leftToolbarTemplate = () => (
        <div className="flex gap-2">
            <CreateButton href='/evidence/create' tooltip={createTooltip ? createTooltip : 'Create record'}/>
            <UpdateButton href='/evidence/update' isSelected={true}
                          tooltip={updateTooltip ? updateTooltip : 'Update record'}/>
            <Button
                onClick={confirm}
                className="p-button-danger"
                icon="pi pi-trash"
                rounded
                tooltip={selectedEvidences.length > 0 ? deleteTooltip : selectDeleteTooltip}
                tooltipOptions={{position: 'top'}}
            />
        </div>
    )
    const rightToolbarTemplate = () => (
        <div className='flex gap-2'>
        <span className="p-input-icon-left">
          <i className="pi pi-search"/>
            <InputText value={globalFilterValue} onChange={onGlobalFilterChange}
                       placeholder={searchById ? searchById : 'Search by ID'}/>
        </span>
            <Button onClick={() => handleClick()} icon='pi pi-refresh' rounded tooltip={refreshTooltip}
                    tooltipOptions={{position: 'top'}}
                    loading={Loading}></Button>
        </div>
    )

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = {
            ...filters,
            stationId: {value: value, matchMode: FilterMatchMode.EQUALS}
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
        if (selectedEvidences.length > 0) {
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
                            value={evidences}
                            selectionMode="checkbox"
                            selection={selectedEvidences}
                            onSelectionChange={onSelectionChange}
                            dataKey="id"
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
                            <Column field="id" header={<Message>{"id"}</Message>} className='font-bold' sortable
                                    hidden={true}/>
                            <Column field="stationId" header={<Message>{"stationId"}</Message>} className='font-bold'
                                    sortable frozen/>
                            <Column field="requestAuthorEmail" header={<Message>{"requestAuthorEmail"}</Message>}
                                    sortable/>
                            <Column field="heading" header={<Message>{"heading"}</Message>} sortable/>
                            <Column field="latitude" header={<Message>{"latitude"}</Message>} sortable/>
                            <Column field="longitude" header={<Message>{"longitude"}</Message>} sortable/>
                            <Column field="local" header={<Message>{"local"}</Message>} sortable/>
                            <Column field="secured" header={<Message>{"secured"}</Message>} sortable/>
                            <Column field="speed" header={<Message>{"speed"}</Message>} sortable/>
                            <Column field="stationType" header={<Message>{"stationType"}</Message>} sortable/>
                            <Column field="timestamp" header={<Message>{"timestamp"}</Message>} body={timestampTemplate}
                                    sortable/>
                        </DataTable>
                    </div>
                </div>
                <div className="col-1"></div>
            </div>
        </>
    );
};

export default MqttEvidenceDataTable;

