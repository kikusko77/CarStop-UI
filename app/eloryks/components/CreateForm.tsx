"use client";
import React, {useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {useCreateVehicle} from "../../api/useVehicle";
import {VehicleFormData, vehicleSchema} from "../schema/vehicleCreateSchema";
import {Vehicle} from "../../interfaces/VehicleCreate";
import {InputText} from "primereact/inputtext";
import {InputNumber} from "primereact/inputnumber";
import {classNames} from "primereact/utils";
import ConfirmButton from "./ConfirmButton";
import get from "lodash/get";
import {useQueryClient} from "@tanstack/react-query";
import {Card} from "primereact/card";
import ResetButton from "@/app/eloryks/components/ResetButton";
import BackButton from "@/app/eloryks/components/BackButton";
import {Message} from "@/app/api/intl/IntlMessage";

const VehicleForm: React.FC = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const createVehicle = useCreateVehicle();
    const [loading, setLoading] = useState<boolean>(false);
    const {
        control,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<VehicleFormData>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: {
            StationId: undefined,
            StationType: "",
            Position: {
                Speed: undefined,
                Heading: undefined,
                Latitude: undefined,
                Longitude: undefined,
                Timestamp: new Date().toISOString(),
            },
            CertificateId: "",
            EncryptionKey: {
                KeyType: null,
                CoordX: null,
                CoordY: null,
            },
            SignKey: {
                KeyType: undefined,
                CoordX: "",
                CoordY: "",
            },
        },
    });


    const onSubmit = (data: VehicleFormData) => {
        setLoading(true)
        const currentTimestamp = new Date().toISOString();
        const cachedVehicles: Vehicle[] | undefined = queryClient.getQueryData(['vehicles']);
        const stationIdExists = cachedVehicles?.some(vehicle => vehicle.StationId === data.StationId);
        if (stationIdExists) {
            alert("This Station ID already exists.");
            return;
        }

        const vehicleData = {
            Vehicle: [
                {
                    ...data,
                    EncryptionKey: data.EncryptionKey
                        ? {
                            KeyType: data.EncryptionKey.KeyType ?? null,
                            CoordX: data.EncryptionKey.CoordX ?? null,
                            CoordY: data.EncryptionKey.CoordY ?? null,
                        }
                        : null,
                    Position: {
                        ...data.Position,
                        Timestamp: currentTimestamp,
                    },
                },
            ],
        };
        createVehicle.mutate(vehicleData, {
            onSuccess: () => {
                router.push("/");
                setLoading(false)
            },
            onError: (error) => {
                console.error("Error submitting form:", error);
            },
        });
    };

    const getFormErrorMessage = (name: keyof VehicleFormData | string) => {
        const error = errors[name as keyof VehicleFormData] || get(errors, name);
        return error && <small className="p-error">{error.message}</small>;
    };

    return (
        <div className="justify-content-center align-items-center sm:mx-5 md:mx-5 lg:mx-7 xl:mx-7">
            <Card title={<h1 className="card-title"><Message>{'create.record'}</Message></h1>}
                  className='card-background text-center p-fluid mt-4 mx-3'>
                <form onSubmit={handleSubmit(onSubmit)} className="p-fluid formgrid grid ">
                    {/* StationId Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4">
                <span className="p-float-label">
                  <Controller
                      name="StationId"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputNumber
                              id={field.name}
                              value={field.value || null}
                              onValueChange={(e) => field.onChange(e.value)}
                              className={classNames({
                                  "p-invalid": fieldState.invalid,
                              })}
                          />
                      )}
                  />
                  <label
                      htmlFor="StationId"
                      className={classNames({"p-error": errors.StationId})}
                  >
                    <Message>{'stationId'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("StationId")}
                    </div>

                    {/* StationType Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3 md:mt-0 lg:mt-0 xl:mt-0">
                <span className="p-float-label">
                  <Controller
                      name="StationType"
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
                      htmlFor="StationType"
                      className={classNames({"p-error": errors.StationType})}
                  >
                    <Message>{'stationType'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("StationType")}
                    </div>

                    {/* Position Fields */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3 md:mt-3 lg:mt-0 xl:mt-0">
                        {/* Speed Field */}
                        <span className="p-float-label">
                  <Controller
                      name="Position.Speed"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputNumber
                              id={field.name}
                              value={field.value || null}
                              onValueChange={(e) => field.onChange(e.value)}
                              className={classNames({
                                  "p-invalid": fieldState.invalid,
                              })}
                          />
                      )}
                  />
                  <label
                      htmlFor="Position.Speed"
                      className={classNames({
                          "p-error": errors.Position?.Speed,
                      })}
                  >
                    <Message>{'speed'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("Position.Speed")}
                    </div>

                    {/* Heading Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
                <span className="p-float-label">
                  <Controller
                      name="Position.Heading"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputNumber
                              id={field.name}
                              value={field.value || null}
                              onValueChange={(e) => field.onChange(e.value)}
                              className={classNames({
                                  "p-invalid": fieldState.invalid,
                              })}
                          />
                      )}
                  />
                  <label
                      htmlFor="Position.Heading"
                      className={classNames({
                          "p-error": errors.Position?.Heading,
                      })}
                  >
                    <Message>{'heading'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("Position.Heading")}
                    </div>

                    {/* Latitude Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
                <span className="p-float-label">
                  <Controller
                      name="Position.Latitude"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputNumber
                              id={field.name}
                              value={field.value || null}
                              onValueChange={(e) => field.onChange(e.value)}
                              className={classNames({
                                  "p-invalid": fieldState.invalid,
                              })}
                          />
                      )}
                  />
                  <label
                      htmlFor="Position.Latitude"
                      className={classNames({
                          "p-error": errors.Position?.Latitude,
                      })}
                  >
                    <Message>{'latitude'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("Position.Latitude")}
                    </div>

                    {/* Longitude Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
                <span className="p-float-label">
                  <Controller
                      name="Position.Longitude"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputNumber
                              id={field.name}
                              value={field.value || null}
                              onValueChange={(e) => field.onChange(e.value)}
                              className={classNames({
                                  "p-invalid": fieldState.invalid,
                              })}
                          />
                      )}
                  />
                  <label
                      htmlFor="Position.Longitude"
                      className={classNames({
                          "p-error": errors.Position?.Longitude,
                      })}
                  >
                    <Message>{'longitude'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("Position.Longitude")}
                    </div>

                    {/* Timestamp Field */}
                    <div className="field col-12 md:col-6 lg:col-6 xl:col-6 mt-3">
                <span className="p-float-label">
                  <Controller
                      name="Position.Timestamp"
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
                      htmlFor="Position.Timestamp"
                      className={classNames({
                          "p-error": errors.Position?.Timestamp,
                      })}
                  >
                    <Message>{'timestamp'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("Position.Timestamp")}
                    </div>

                    {/* CertificateId Field */}
                    <div className="field col-12 md:col-6 lg:col-6 xl:col-6 mt-3">
                <span className="p-float-label">
                  <Controller
                      name="CertificateId"
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
                      htmlFor="CertificateId"
                      className={classNames({"p-error": errors.CertificateId})}
                  >
                    <Message>{'certificateId'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("CertificateId")}
                    </div>

                    {/* EncryptionKey Fields */}
                    <h3 className='col-12 text-left'>Encryption Key fields</h3>

                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
                        {/* KeyType Field */}
                        <span className="p-float-label">
                  <Controller
                      name="EncryptionKey.KeyType"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputNumber
                              id={field.name}
                              value={field.value || null}
                              onValueChange={(e) => field.onChange(e.value)}
                              className={classNames({
                                  "p-invalid": fieldState.invalid,
                              })}
                          />
                      )}
                  />
                  <label
                      htmlFor="EncryptionKey.KeyType"
                      className={classNames({
                          "p-error": errors.EncryptionKey?.KeyType,
                      })}
                  >
                    <Message>{'encryption.keyType'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("EncryptionKey.KeyType")}
                    </div>

                    {/* CoordX Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
                <span className="p-float-label">
                  <Controller
                      name="EncryptionKey.CoordX"
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
                      htmlFor="EncryptionKey.CoordX"
                      className={classNames({
                          "p-error": errors.EncryptionKey?.CoordX,
                      })}
                  >
                    <Message>{'encryption.coordX'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("EncryptionKey.CoordX")}
                    </div>

                    {/* CoordY Field */}
                    <div className="field col-12 md:col-12 lg:col-4 xl:col-4 mt-3">
                <span className="p-float-label">
                  <Controller
                      name="EncryptionKey.CoordY"
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
                      htmlFor="EncryptionKey.CoordY"
                      className={classNames({
                          "p-error": errors.EncryptionKey?.CoordY,
                      })}
                  >
                    <Message>{'encryption.coordY'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("EncryptionKey.CoordY")}
                    </div>

                    {/* SignKey Fields */}

                    <h3 className='col-12 text-left'>Sign Key fields</h3>

                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
                        {/* KeyType Field */}
                        <span className="p-float-label">
                  <Controller
                      name="SignKey.KeyType"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputNumber
                              id={field.name}
                              value={field.value || null}
                              onValueChange={(e) => field.onChange(e.value)}
                              className={classNames({
                                  "p-invalid": fieldState.invalid,
                              })}
                          />
                      )}
                  />
                  <label
                      htmlFor="SignKey.KeyType"
                      className={classNames({
                          "p-error": errors.SignKey?.KeyType,
                      })}
                  >
                    <Message>{'signature.keyType'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("SignKey.KeyType")}
                    </div>

                    {/* CoordX Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
                <span className="p-float-label">
                  <Controller
                      name="SignKey.CoordX"
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
                      htmlFor="SignKey.CoordX"
                      className={classNames({
                          "p-error": errors.SignKey?.CoordX,
                      })}
                  >
                    <Message>{'signature.coordX'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("SignKey.CoordX")}
                    </div>

                    {/* CoordY Field */}
                    <div className="field col-12 md:col-12 lg:col-4 xl:col-4 mt-3">
                <span className="p-float-label">
                  <Controller
                      name="SignKey.CoordY"
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
                      htmlFor="SignKey.CoordY"
                      className={classNames({
                          "p-error": errors.SignKey?.CoordY,
                      })}
                  >
                    <Message>{'signature.coordY'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("SignKey.CoordY")}
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

export default VehicleForm;
