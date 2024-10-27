"use client";
import React, {useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";
import {InputText} from "primereact/inputtext";
import {InputNumber} from "primereact/inputnumber";
import {classNames} from "primereact/utils";
import ConfirmButton from "@/app/eloryks/components/ConfirmButton";
import get from "lodash/get";
import {useQueryClient} from "@tanstack/react-query";
import {Card} from "primereact/card";
import ResetButton from "@/app/eloryks/components/ResetButton";
import BackButton from "@/app/eloryks/components/BackButton";
import {Message} from "@/app/api/intl/IntlMessage";
import {useCreateMqttEvidence, useUpdateMqttEvidence} from "@/app/api/useMqttEvidence";
import {CreateEvidenceSchema, EvidenceFormData, UpdateEvidenceSchema} from "@/app/eloryks/schema/mqttEvidenceSchema";
import {MqttEvidence} from "@/app/interfaces/MqttEvidence";
import {InputSwitch} from "primereact/inputswitch";
import {useMqttEvidenceContext} from "@/app/eloryks/components/providers/MqttEvidenceContext";
import {Calendar} from "primereact/calendar";

// @ts-ignore
const EvidenceForm: React.FC = ({params: {managed}}) => {
    const router = useRouter();
    const createEvidence = useCreateMqttEvidence();
    const updateEvidence = useUpdateMqttEvidence();
    const [loading, setLoading] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const {selectedEvidences, setSelectedEvidences} = useMqttEvidenceContext();
    const selectedEvidence = selectedEvidences[0]
    const selectedEvidenceId = selectedEvidences.length > 0 ? selectedEvidence.stationId : null;
    const evidences = queryClient.getQueryData<MqttEvidence[]>(['mqttEvidence']) || [];
    const selectedEvidenceData = evidences.find(evidence => evidence.stationId === selectedEvidenceId)
    // @ts-ignore
    const defaultValues: UserFormData = managed[0] === 'create' ?
        {
            requestAuthorEmail: undefined,
            heading: undefined,
            latitude: undefined,
            longitude: undefined,
            local: undefined,
            secured: undefined,
            speed: undefined,
            stationId: undefined,
            stationType: "",
            timestamp: undefined,
        }
        : selectedEvidenceData && {
        id: selectedEvidenceData.id,
        requestAuthorEmail: selectedEvidenceData.requestAuthorEmail,
        heading: selectedEvidenceData.heading,
        latitude: selectedEvidenceData.latitude,
        longitude: selectedEvidenceData.longitude,
        local: selectedEvidenceData.local,
        secured: selectedEvidenceData.secured,
        speed: selectedEvidenceData.speed,
        stationId: selectedEvidenceData.stationId,
        stationType: selectedEvidenceData.stationType,
        timestamp: new Date(selectedEvidenceData.timestamp)
    }
    const formSchema = managed[0] === 'update' ? UpdateEvidenceSchema : CreateEvidenceSchema;
    const {
        control,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<EvidenceFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues
    });


    const onSubmit = (data: EvidenceFormData) => {
        setLoading(true)
        if (managed[0] === 'create') {
            const stationIdExists = evidences?.some(vehicle => vehicle.stationId === data.stationId);
            if (stationIdExists) {
                alert("This Station ID already exists.");
                return;
            }
            // @ts-ignore
            createEvidence.mutate(data, {
                onSuccess: () => {
                    router.push("/");
                    setLoading(false)
                },
                onError: (error) => {
                    console.error("Error submitting form:", error);
                    setLoading(false)
                },
            });
        } else {
            const EvidenceData = {
                ...data,
                id: selectedEvidenceData?.id,
                timestamp: data.timestamp?.toISOString(),
            };
            // @ts-ignore
            updateEvidence.mutate(EvidenceData, {
                onSuccess: () => {
                    setSelectedEvidences([]);
                    setLoading(false)
                    router.push("/");
                },
                onError: (error) => {
                    console.error("Error submitting form:", error);
                    setLoading(false)
                },
            });
        }
    };

    const getFormErrorMessage = (name: keyof EvidenceFormData | string) => {
        const error = errors[name as keyof EvidenceFormData] || get(errors, name);
        return error && <small className="p-error">{error.message}</small>;
    };

    return (
        <div className="justify-content-center align-items-center sm:mx-5 md:mx-5 lg:mx-7 xl:mx-7">
            <Card title={<h1 className="card-title">{managed[0] === 'create' ? <Message>{'create.record'}</Message> :
                <Message>{'update.record'}</Message>}</h1>}
                  className='card-background text-center p-fluid mt-4 mx-3'>
                <form onSubmit={handleSubmit(onSubmit)} className="p-fluid formgrid grid ">

                    {/* stationId Fields */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3 md:mt-0 lg:mt-0 xl:mt-0">
                        <span className="p-float-label">
                  <Controller
                      name="stationId"
                      control={control}
                      render={({field, fieldState}) => (
                          <InputNumber
                              disabled={managed[0] === 'update'}
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
                      htmlFor="stationId"
                      className={classNames({
                          "p-error": errors.stationId,
                      })}
                  >
                    <Message>{'stationId'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("stationId")}
                    </div>

                    {/* requestAuthorEmail Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3 md:mt-0 lg:mt-0 xl:mt-0">
                <span className="p-float-label">
                  <Controller
                      name="requestAuthorEmail"
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
                      htmlFor="requestAuthorEmail"
                      className={classNames({"p-error": errors.requestAuthorEmail})}
                  >
                    <Message>{'requestAuthorEmail'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("StationType")}
                    </div>

                    {/* Position Fields */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3 md:mt-3 lg:mt-0 xl:mt-0">
                        {/* Speed Field */}
                        <span className="p-float-label">
                  <Controller
                      name="heading"
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
                      htmlFor="heading"
                      className={classNames({
                          "p-error": errors.heading,
                      })}
                  >
                    <Message>{'heading'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("heading")}
                    </div>

                    {/* latitude Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
                <span className="p-float-label">
                  <Controller
                      name="latitude"
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
                      htmlFor="latitude"
                      className={classNames({
                          "p-error": errors.latitude,
                      })}
                  >
                    <Message>{'latitude'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("latitude")}
                    </div>

                    {/* longitude Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
                <span className="p-float-label">
                  <Controller
                      name="longitude"
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
                      htmlFor="longitude"
                      className={classNames({
                          "p-error": errors.longitude,
                      })}
                  >
                    <Message>{'longitude'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("longitude")}
                    </div>

                    {/* secured Fields */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
                        <span className="p-float-label">
                  <Controller
                      name="secured"
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
                      htmlFor="secured"
                      className={classNames({
                          "p-error": errors.secured,
                      })}
                  >
                    <Message>{'secured'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("secured")}
                    </div>

                    {/* speed Fields */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
                        <span className="p-float-label">
                  <Controller
                      name="speed"
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
                      htmlFor="speed"
                      className={classNames({
                          "p-error": errors.speed,
                      })}
                  >
                    <Message>{'speed'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("speed")}
                    </div>

                    {/* stationType Field */}
                    <div className="field col-12 md:col-6 lg:col-4 xl:col-4 mt-3">
                <span className="p-float-label">
                  <Controller
                      name="stationType"
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
                      htmlFor="stationType"
                      className={classNames({"p-error": errors.stationType})}
                  >
                    <Message>{'stationType'}</Message>
                  </label>
                </span>
                        {getFormErrorMessage("StationType")}
                    </div>

                    {managed[0] === 'update' &&
                        <div className='field col-12 md:col-6 lg:col-4 xl:col-4 mt-3'>
                                <span className="p-float-label">
                                <Controller
                                    name={`timestamp`}
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
                                            className={classNames({
                                                "p-invalid": fieldState.invalid,
                                                'w-full': true,
                                            })}
                                        />
                                    )}
                                />
                                    <label htmlFor={`timestamp`}
                                           className={classNames({"p-error": errors.timestamp})}>
                                        <Message>{'timestamp'}</Message>
                                    </label>
                                </span>
                            {getFormErrorMessage(`timestamp`)}
                        </div>}

                    {/* local Field */}
                    <div className="field col-4 mt-3">
                      <span className="p-float-label" style={{display: 'flex', alignItems: 'center'}}>
                      <Controller
                          name="local"
                          control={control}
                          render={({field, fieldState}) => (
                              <InputSwitch
                                  id={field.name}
                                  checked={field.value as boolean}
                                  onChange={(e) => field.onChange(e.value)}
                                  className={classNames({
                                      "p-invalid": fieldState.invalid,
                                  })}
                              />
                          )}
                      />
                   <label
                       htmlFor="local"
                       className={classNames({
                           "p-error": errors.local,
                       })}
                       style={{marginLeft: '50px'}}
                   >
                  <Message>{'local'}</Message>
                 </label>
                </span>
                        {getFormErrorMessage("local")}
                    </div>

                    <div className="flex col-12 flex-row justify-content-end">
                        <div className="mr-auto">
                            {/*@ts-ignore*/}
                            <BackButton label={<Message>{'back'}</Message>} onClick={() => router.back(2)}/>
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

export default EvidenceForm;
