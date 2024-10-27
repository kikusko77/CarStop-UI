"use client";
import {useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {InputText} from "primereact/inputtext";
import {classNames} from "primereact/utils";
import ConfirmButton from "@/app/eloryks/components/ConfirmButton";
import get from "lodash/get";
import {useQueryClient} from "@tanstack/react-query";
import {Card} from "primereact/card";
import ResetButton from "@/app/eloryks/components/ResetButton";
import BackButton from "@/app/eloryks/components/BackButton";
import {useCreateUser, useUpdateUser} from "@/app/api/useUser";
import {User} from "@/app/interfaces/User";
import {createUserSchema, updateUserSchema, UserFormData} from "@/app/eloryks/schema/userSchema";
import {useUserContext} from "@/app/eloryks/components/providers/UserContext";
import {MultiSelect, MultiSelectChangeEvent} from "primereact/multiselect";
import {Role} from "@/app/interfaces/Role";
import {Calendar} from "primereact/calendar";
import {Message} from "@/app/api/intl/IntlMessage";

// @ts-ignore
export default function UserForm({params: {managed}}) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const createUser = useCreateUser();
    const updateUser = useUpdateUser();
    const {selectedUsers, setSelectedUsers} = useUserContext();
    const selectedUser = selectedUsers[0]
    const selectedUserId = selectedUsers.length > 0 ? selectedUser.idPerson : null;
    const [loading, setLoading] = useState<boolean>(false);
    const users = queryClient.getQueryData<User[]>(['users']) || [];
    const selectedUserData = users.find(user => user.idPerson === selectedUserId)
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
    const currentDate = new Date();
    const roleOptions: Role[] = [
        {name: 'Admin', idRole: 1},
        {name: 'User', idRole: 2}
    ]

    // @ts-ignore
    const defaultValues: UserFormData = managed[0] === 'create' ?
        {
            email: undefined,
            givenName: '',
            familyName: '',
            nickname: '',
            personRoles: [{idRole: undefined, startedAt: undefined, endedAt: undefined, expirationDate: undefined}],
            pwd: undefined,
            roles: [{name: undefined, idRole: undefined}]
        }
        : selectedUserData && {
        idPerson: selectedUserData.idPerson,
        email: selectedUserData.email,
        givenName: selectedUserData?.givenName || '',
        familyName: selectedUserData.familyName || '',
        nickname: selectedUserData.nickname || '',
        personRoles: selectedUserData.personRoles.map((item, index) => ({
            idRole: item.idRole,
            startedAt: item.startedAt !== null ? new Date(item.startedAt) : undefined,
            endedAt: item.endedAt ? new Date(item.endedAt) : null,
            expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
        })),
        pwd: undefined,
        roles: [{name: undefined, idRole: undefined}]
    }
    const formSchema = managed[0] === 'update' ? updateUserSchema : createUserSchema;
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: {errors},
    } = useForm<UserFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    });

    useEffect(() => {
        if (selectedUserData) {
            const initialSelectedRoles = selectedUserData.personRoles
                .map(pr => roleOptions.find(ro => ro.idRole === pr.idRole))
                .filter(role => role !== undefined);
            // @ts-ignore
            setSelectedRoles(initialSelectedRoles);
            // @ts-ignore
            setValue('roles', initialSelectedRoles);
        }
    }, [selectedUserData]);

    const onSubmit = (data: User) => {
        setLoading(true)
        if (managed[0] === 'create') {
            const existingDates = {
                startedAt: data.personRoles[0].startedAt?.toISOString(),
                endedAt: data.personRoles[0].endedAt?.toISOString(),
                expirationDate: data.personRoles[0].expirationDate?.toISOString(),
            }

            const newPersonRoles = data.roles.map(role => ({
                idRole: role.idRole,
                startedAt: existingDates.startedAt,
                endedAt: existingDates.endedAt,
                expirationDate: existingDates.expirationDate,
            }));

            const UserData = {
                ...data,
                personRoles: newPersonRoles
            };

            //@ts-ignore
            createUser.mutate(UserData, {
                onSuccess: () => {
                    router.push("/users");
                    setLoading(false)
                },
                onError: (error) => {
                    console.error("Error submitting form:", error);
                    setLoading(false)
                },
            });
        } else {

            const existingDates = {
                startedAt: data.personRoles[0].startedAt?.toISOString(),
                endedAt: data.personRoles[0].endedAt?.toISOString(),
                expirationDate: data.personRoles[0].expirationDate?.toISOString(),
            }

            const newPersonRoles = data.roles.map(role => ({
                idRole: role.idRole,
                startedAt: existingDates.startedAt,
                endedAt: existingDates.endedAt,
                expirationDate: existingDates.expirationDate,
            }));

            const UserData = {
                ...data,
                idPerson: selectedUserData?.idPerson,
                personRoles: newPersonRoles
            };
            // @ts-ignore
            updateUser.mutate(UserData, {
                onSuccess: () => {
                    setSelectedUsers([]);
                    setLoading(false)
                    router.push("/users");
                },
                onError: (error) => {
                    console.error("Error submitting form:", error);
                    setLoading(false)
                },
            });
        }

    };

    const getFormErrorMessage = (name: keyof UserFormData | string) => {
        const error = errors[name as keyof UserFormData] || get(errors, name);
        return error && <small className="p-error">{error.message}</small>;
    };

    // @ts-ignore
    return (
        <div className="justify-content-center align-items-center sm:mx-5 md:mx-5 lg:mx-7 xl:mx-7">
            <Card title={<h1 className="card-title">{managed[0] === 'create' ? <Message>{'create.user'}</Message> : <Message>{'update.user'}</Message>}</h1>}
                  className='card-background text-center p-fluid mt-4 mx-3'>
                <form onSubmit={handleSubmit(onSubmit)} className="p-fluid formgrid grid ">
                    {/* Email Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3 md:mt-0 lg:mt-0 xl:mt-0">
                <span className="p-float-label">
                  <Controller
                      name="email"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputText
                              id={field.name}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              className={classNames({
                                  "p-invalid": fieldState.invalid,
                              })}
                          />
                      )}
                  />
                  <label
                      htmlFor="email"
                      className={classNames({"p-error": errors.email})}
                  >
                    <Message>{'email'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("email")}
                    </div>

                    {/* GivenName Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3 md:mt-0 lg:mt-0 xl:mt-0">
                <span className="p-float-label">
                  <Controller
                      name="givenName"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputText
                              id={field.name}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              className={classNames({
                                  "p-invalid": fieldState.invalid,
                              })}
                          />
                      )}
                  />
                  <label
                      htmlFor="givenName"
                      className={classNames({"p-error": errors.givenName})}
                  >
                    <Message>{'givenName'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("givenName")}
                    </div>

                    {/* FamilyName Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3 md:mt-0 lg:mt-0 xl:mt-0">
                <span className="p-float-label">
                  <Controller
                      name="familyName"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputText
                              id={field.name}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              className={classNames({
                                  "p-invalid": fieldState.invalid,
                              })}
                          />
                      )}
                  />
                  <label
                      htmlFor="familyName"
                      className={classNames({"p-error": errors.familyName})}
                  >
                    <Message>{'familyName'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("familyName")}
                    </div>

                    {/* Nickname Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
                <span className="p-float-label">
                  <Controller
                      name="nickname"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputText
                              id={field.name}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              className={classNames({
                                  "p-invalid": fieldState.invalid,
                              })}
                          />
                      )}
                  />
                  <label
                      htmlFor="nickname"
                      className={classNames({"p-error": errors.nickname})}
                  >
                    <Message>{'nickname'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("nickname")}
                    </div>

                    {/* Password Field */}
                    {managed[0] === 'create' && (
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
                <span className="p-float-label">
                  <Controller
                      name="pwd"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputText
                              id={field.name}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              className={classNames({
                                  "p-invalid": fieldState.invalid,
                              })}
                          />
                      )}
                  />
                  <label
                      htmlFor="pwd"
                      className={classNames({"p-error": errors.pwd})}
                  >
                    <Message>{'password'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("pwd")}
                    </div>)}
                    <div className='field col-12 md:col-6 lg:col-4 xl:col-4 mt-3'>
                            <span className="p-float-label">
                            <Controller
                                name={`roles`}
                                control={control}
                                render={({field, fieldState}) => (
                                    <MultiSelect
                                        value={selectedRoles}
                                        onChange={(e: MultiSelectChangeEvent) => {
                                            setSelectedRoles(e.value);
                                            setValue("roles", e.value);
                                        }}
                                        options={roleOptions}
                                        display="chip"
                                        maxSelectedLabels={2}
                                        optionLabel="name"
                                        className={classNames({
                                            "p-invalid": fieldState.invalid,
                                            'w-full': true,
                                            'text-left': true,
                                        })}
                                        placeholder="Select Role"
                                        required={true}
                                    />
                                )}
                            />
                                 <label htmlFor={`roles`}
                                        className={classNames({"p-error": errors.roles})}>
                                 <Message>{'roles'}</Message>
                                  </label>
                               </span>
                        {getFormErrorMessage(`roles`)}
                    </div>
                    <div className='field col-12 md:col-6 lg:col-4 xl:col-4 mt-3'>
                                <span className="p-float-label">
                                <Controller
                                    name={`personRoles.0.startedAt`}
                                    control={control}
                                    render={({field, fieldState}) => (
                                        <Calendar
                                            value={field.value ? new Date(field.value) : null}
                                            onChange={(e) => field.onChange(e.value)}
                                            dateFormat="dd/mm/yy"
                                            showIcon
                                            hourFormat="24"
                                            showTime
                                            required={true}
                                            minDate={currentDate}
                                            className={classNames({
                                                "p-invalid": fieldState.invalid,
                                                'w-full': true,
                                            })}
                                        />
                                    )}
                                />
                                    <label htmlFor={`personRoles.0.startedAt`}
                                           className={classNames({"p-error": errors.personRoles?.[0]?.startedAt})}>
                                        <Message>{'startedAt'}</Message>
                                    </label>
                                </span>
                        {getFormErrorMessage(`personRoles.0.startedAt`)}
                    </div>
                    <div className={`field col-12 md:col-6 ${managed[0] === 'update' ? 'lg:col-6 xl:col-6' : 'lg:col-4 xl:col-4'} mt-3`}>
                                <span className="p-float-label">
                                <Controller
                                    name={`personRoles.0.endedAt`}
                                    control={control}
                                    render={({field, fieldState}) => (
                                        <Calendar
                                            value={field.value ? new Date(field.value) : null}
                                            onChange={(e) => field.onChange(e.value)}
                                            dateFormat="dd/mm/yy"
                                            showIcon
                                            hourFormat="24"
                                            showTime
                                            className={classNames({
                                                "p-invalid": fieldState.invalid,
                                                'w-full': true,
                                            })}
                                        />
                                    )}
                                />
                                    <label htmlFor={`personRoles.0.endedAt`}
                                           className={classNames({"p-error": errors.personRoles?.[0]?.endedAt})}>
                                        <Message>{'endedAt'}</Message>
                                    </label>
                                </span>
                        {getFormErrorMessage(`personRoles.0.endedAt`)}
                    </div>
                    <div className={`field col-12 md:col-6 ${managed[0] === 'update' ? 'lg:col-6 xl:col-6' : 'lg:col-4 xl:col-4'} mt-3`}>
                                <span className="p-float-label">
                                <Controller
                                    name={`personRoles.0.expirationDate`}
                                    control={control}
                                    render={({field, fieldState}) => (
                                        <Calendar
                                            value={field.value ? new Date(field.value) : null}
                                            onChange={(e) => field.onChange(e.value)}
                                            dateFormat="dd/mm/yy"
                                            showIcon
                                            hourFormat="24"
                                            showTime
                                            className={classNames({
                                                "p-invalid": fieldState.invalid,
                                                'w-full': true,
                                            })}
                                        />
                                    )}
                                />
                                    <label htmlFor={`personRoles.0.expirationDate`}
                                           className={classNames({"p-error": errors.personRoles?.[0]?.expirationDate})}>
                                        <Message>{'expirationDate'}</Message>
                                    </label>
                                </span>
                        {getFormErrorMessage(`personRoles.0.expirationDate`)}
                    </div>
                    <div className="flex col-12 flex-row justify-content-end">
                        <div className="mr-auto">
                            {/*@ts-ignore*/}
                            <BackButton label={<Message>{'back'}</Message>} onClick={() => router.back()}/>
                        </div>
                        {/*@ts-ignore*/}
                        <ResetButton label={<Message>{'reset'}</Message>} onClick={() => reset()}/>
                        {/*@ts-ignore*/}
                        <ConfirmButton label={<Message>{'submit'}</Message>} loading={loading} onClick={handleSubmit(onSubmit)}/>
                    </div>
                </form>
            </Card>
        </div>
    );
};

