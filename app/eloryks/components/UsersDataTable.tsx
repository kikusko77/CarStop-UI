"use client";
import React, {useRef, useState} from "react";
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
import {useQuery} from "@tanstack/react-query";
import {ConfirmDialog, confirmDialog} from "primereact/confirmdialog";
import {Toast} from "primereact/toast";
import {fetchUsers} from "@/app/api/useUserSSR";
import {User} from "@/app/interfaces/User";
import {Role} from "@/app/api/auth/Role";
import {useDeleteUsers} from "@/app/api/useUser";
import {useUserContext} from "@/app/eloryks/components/providers/UserContext";
import {Message, useMessage} from "@/app/api/intl/IntlMessage";

interface SelectionChangeEvent {
    value: User[];
}
const VehicleDataTable = () => {
    const {selectedUsers, setSelectedUsers} = useUserContext();
    const deleteUsers = useDeleteUsers();
    const [globalFilterValue, setGlobalFilterValue] = useState<string>('');
    const [filters, setFilters] = useState<DataTableFilterMeta>({
        idPerson: {value: null, matchMode: FilterMatchMode.CONTAINS},
        email: {value: null, matchMode: FilterMatchMode.CONTAINS},
        givenName: {value: null, matchMode: FilterMatchMode.CONTAINS},
        familyName: {value: null, matchMode: FilterMatchMode.CONTAINS},
        nickname: {value: null, matchMode: FilterMatchMode.CONTAINS},
        'personRoles.startedAt': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'personRoles.endedAt': {value: null, matchMode: FilterMatchMode.CONTAINS},
        'personRoles.expirationDate': {value: null, matchMode: FilterMatchMode.CONTAINS},
    });
    const searchByEmail = useMessage({ value: "search.byEmail" })
    const createTooltip = useMessage({ value: "create.user" })
    const updateTooltip = useMessage({ value: "update.user" })
    const selectUserTooltip = useMessage({ value: "select.user" })
    const deleteTooltip = useMessage({ value: "delete.user" })
    const selectDeleteTooltip = useMessage({ value: "select.delete.user" })
    const deleteErrorTooltip = useMessage({ value: "delete.error" })
    const deleteConfirmationTooltip = useMessage({ value: "confirmed" })
    const deleteSuccessTooltip = useMessage({ value: "delete.success" })
    const deleteRejectedTooltip = useMessage({ value: "rejected" })
    const beforeDeleteTooltip = useMessage({ value: "delete.question" })
    const beforeDeleteTooltipConf = useMessage({ value: "delete.confirmation" })
    const yesTooltip = useMessage({ value: "yes" })
    const noTooltip = useMessage({ value: "no" })
    // @ts-ignore
    const {data: users, isLoading, error} = useQuery({
        queryKey: ['users'],
        queryFn: () => fetchUsers(),
    });
    const toast = useRef<Toast>(null);
    const onSelectionChange = (e: SelectionChangeEvent) => {
        setSelectedUsers(e.value);
    };

    const handleDelete = async () => {
        const idsToDelete = selectedUsers.map(user => user.idPerson);
        // @ts-ignore
        await deleteUsers.mutateAsync(idsToDelete, {
            onSuccess: () => {
                setSelectedUsers([]);
            },
            onError: (error) => {
                console.error("Error deleting vehicles:", error);
            },
        });
    };

    const timestampTemplate = (rowData: any) => {
        if (!rowData){
            return <span></span>
        }
        return <DateFormat value={rowData}/>;
    };

    const getRoleName = (idRole: number): string => {
        switch (idRole) {
            case 1:
                return Role.ADMIN;
            case 2:
                return Role.USER;
            default:
                return "Unknown role";
        }
    }

    const formatRoles = (personRoles: { idRole: number }[]): string => {
        return personRoles.map(role => getRoleName(role.idRole)).join(', ');
    }

    const leftToolbarTemplate = () => (
        <>
            <div className="flex align-items-center justify-content-end gap-2">
                <CreateButton href='/users/create' tooltip={createTooltip ? createTooltip : 'Create user'}/>
                <UpdateButton href='/users/update'
                              tooltip={selectedUsers.length > 0 ? updateTooltip : selectUserTooltip}
                              isSelected={selectedUsers.length > 0} />

                <Button
                    onClick={confirm}
                    className="p-button-danger"
                    icon="pi pi-trash"
                    rounded
                    tooltip={selectedUsers.length > 0 ? deleteTooltip : selectDeleteTooltip}
                    tooltipOptions={{position: 'top'}}
                />
            </div>
        </>
    )

    const rightToolbarTemplate = () => (
        <>
        <span className="p-input-icon-left">
          <i className="pi pi-search"/>
          <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder={searchByEmail ? searchByEmail : 'Search by Email'} />
        </span>
        </>
    )

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = {
            ...filters,
            email: {value: value, matchMode: FilterMatchMode.CONTAINS}
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
        if (selectedUsers.length > 0) {
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
                            value={users}
                            selectionMode="checkbox"
                            selection={selectedUsers}
                            onSelectionChange={onSelectionChange}
                            dataKey="idPerson"
                            className="p-datatable"
                            showGridlines
                            stripedRows
                            rows={10}
                            paginator
                            rowsPerPageOptions={[10, 15, 20]}
                            size="small"
                            scrollable={true}
                            filters={filters}
                        >
                            <Column
                                selectionMode="multiple"
                                headerStyle={{width: "3rem"}}
                                frozen
                            ></Column>
                            <Column field="email" header={<Message>{'email'}</Message>} sortable/>
                            <Column field="personRoles" header={<Message>{'roles'}</Message>}
                                    body={(rowData) => formatRoles(rowData.personRoles)} sortable/>
                            <Column field="givenName" header={<Message>{'givenName'}</Message>} sortable/>
                            <Column field="familyName" header={<Message>{'familyName'}</Message>} sortable/>
                            <Column field="nickname" header={<Message>{'nickname'}</Message>} sortable/>
                            <Column field="personRoles.startedAt" header={<Message>{'startedAt'}</Message>}
                                    body={(rowData) => timestampTemplate(rowData.personRoles[0].startedAt)} sortable/>
                            <Column field="personRoles.endedAt" header={<Message>{'endedAt'}</Message>}
                                    body={(rowData) => timestampTemplate(rowData.personRoles[0]?.endedAt)} sortable/>
                            <Column field="personRoles.expirationDate" header={<Message>{'expirationDate'}</Message>}
                                    body={(rowData) => timestampTemplate(rowData.personRoles[0]?.expirationDate)}
                                    sortable/>
                        </DataTable>
                    </div>
                </div>
                <div className="col-1"></div>
            </div>
        </>
    );
};

export default VehicleDataTable;

