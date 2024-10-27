"use client";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {useUpdateVehicle} from "../../api/useVehicle";
import ConfirmButton from "./ConfirmButton";
import {InputText} from "primereact/inputtext";
import {VehicleFormData, vehicleSchema} from "../schema/vehicleUpdateSchema";
import get from "lodash/get";
import {useVehicleContext} from "./providers/VehicleContext";
import {Controller, useForm} from "react-hook-form";
import {InputNumber} from "primereact/inputnumber";
import {classNames} from "primereact/utils";
import React, {useState} from "react";
import {Card} from "primereact/card";
import BackButton from "@/app/eloryks/components/BackButton";
import ResetButton from "@/app/eloryks/components/ResetButton";
import {useQueryClient} from "@tanstack/react-query";
import {Vehicle} from "@/app/interfaces/VehicleUpdate";
import {Message} from "@/app/api/intl/IntlMessage";

const VehicleUpdateForm = () => {
    const router = useRouter();
    const updateVehicle = useUpdateVehicle();
    const {selectedVehicles, setSelectedVehicles} = useVehicleContext();
    const selectedVehicle = selectedVehicles[0];
    const selectedVehicleId = selectedVehicles.length > 0 ? selectedVehicle.StationId : null;
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState<boolean>(false);
    const vehicles = queryClient.getQueryData<Vehicle[]>(['vehicles']) || [];
    const vehicleData = vehicles.find(vehicle => vehicle.StationId === selectedVehicleId);

    const {
        handleSubmit,
        control,
        reset,
        formState: {errors},
    } = useForm<VehicleFormData>({
        resolver: zodResolver(vehicleSchema),
        defaultValues: vehicleData ? {
                StationId: vehicleData.StationId,
                SpeedLimit: {
                    Speed: vehicleData.SpeedLimit.Speed,
                    EngineSpeed: vehicleData.SpeedLimit.EngineSpeed,
                },
                Position: {
                    Speed: vehicleData.Position.Speed,
                    Heading: vehicleData.Position.Heading,
                    Latitude: vehicleData.Position.Latitude,
                    Longitude: vehicleData.Position.Longitude,
                    Timestamp: new Date().toISOString(),
                },
            } :
            {
                StationId: selectedVehicleId || undefined,
                SpeedLimit: {
                    Speed: undefined,
                    EngineSpeed: undefined,
                },
                Position: {
                    Speed: undefined,
                    Heading: undefined,
                    Latitude: undefined,
                    Longitude: undefined,
                    Timestamp: new Date().toISOString(),
                },
            },
    });

    const onSubmit = (data: VehicleFormData) => {

        setLoading(true)
        const currentTimestamp = new Date().toISOString();

        const vehicleData = {
            Vehicle: [
                {
                    ...data,
                    Position: {
                        ...data.Position,
                        Timestamp: currentTimestamp,
                    },
                },
            ],
        };

        // @ts-ignore
        updateVehicle.mutate(vehicleData, {
            onSuccess: () => {
                setSelectedVehicles([]);
                setLoading(false)
                router.push("/");
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

    // @ts-ignore
    return (

        <div className="justify-content-center align-items-center sm:mx-5 md:mx-5 lg:mx-7 xl:mx-7">
            <Card title={<h1 className="card-title"><Message>{'update.record'}</Message></h1>}
                  className='card-background text-center p-fluid mt-4 mx-3'>
                <form onSubmit={handleSubmit(onSubmit)} className="p-fluid formgrid grid ">
                    {/* StationId Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3 md:mt-0 lg:mt-0 xl:mt-0">
                <span className="p-float-label">
                  <Controller
                      name="StationId"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputNumber
                              disabled
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
                    {/* SpeedLimit Fields */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3 md:mt-0 lg:mt-0 xl:mt-0">
                <span className="p-float-label">
                  <Controller
                      name="SpeedLimit.Speed"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputNumber
                              id="SpeedLimit.Speed"
                              value={field.value || null}
                              onValueChange={(e) => field.onChange(e.value)}
                              className={classNames({
                                  "p-invalid": fieldState.invalid,
                              })}
                          />
                      )}
                  />
                  <label
                      htmlFor="SpeedLimit.Speed"
                      className={classNames({
                          "p-error": errors.SpeedLimit?.Speed,
                      })}
                  >
                    <Message>{'speedLimit'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("SpeedLimit.Speed")}
                    </div>

                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3 md:mt-3 lg:mt-0 xl:mt-0">
                <span className="p-float-label">
                  <Controller
                      name="SpeedLimit.EngineSpeed"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputNumber
                              id="SpeedLimit.EngineSpeed"
                              value={field.value || null}
                              onValueChange={(e) => field.onChange(e.value)}
                              className={classNames({
                                  "p-invalid": fieldState.invalid,
                              })}
                          />
                      )}
                  />
                  <label
                      htmlFor="SpeedLimit.EngineSpeed"
                      className={classNames({
                          "p-error": errors.SpeedLimit?.EngineSpeed,
                      })}
                  >
                    <Message>{'engineSpeed'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("SpeedLimit.EngineSpeed")}
                    </div>
                    {/* Position Fields */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
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
                    <div className="field col-12 md:col-6 lg:col-6 xl:col-6 mt-3">
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

                    <div className="flex col-12 flex-row justify-content-end">
                        <div className="mr-auto">
                            {/*@ts-ignore*/}
                            <BackButton label={<Message>{'back'}</Message>} onClick={() => router.back()}/>
                        </div>
                        {/*@ts-ignore*/}
                        <ResetButton label={<Message>{'reset'}</Message>} onClick={() => reset()}/>
                        {/*@ts-ignore*/}
                        <ConfirmButton label={<Message>{'submit'}</Message>} loading={loading}
                                       onClick={handleSubmit(onSubmit)}/>
                    </div>
                </form>
            </Card>
        </div>

    );
};

export default VehicleUpdateForm;
