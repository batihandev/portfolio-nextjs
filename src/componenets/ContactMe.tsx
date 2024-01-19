"use client";
import React, { useEffect, useState } from "react";
import { PhoneIcon, MapPinIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { useForm, SubmitHandler } from "react-hook-form";
import { PageInfo } from "typings";
import Loader from "./Loader";
import toast, { Toaster } from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";
type Props = {
  pageInfo: PageInfo;
};

type Inputs = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const ContactMe = ({ pageInfo }: Props) => {
  const { register, handleSubmit, reset, setValue } = useForm<Inputs>();
  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setValue(name, value); // Update the input value in the form state
  };
  const recaptchaRef = React.createRef<any>();

  const [verified, setVerified] = useState(false);
  const onChangeCaptcha = (value: any) => {
    setVerified(true);
  };
  const [buttonClicked, setButtonClicked] = useState(false);

  const notify = (mailSent?: boolean) => {
    if (!mailSent) toast("Failed to send Mail.");
    else {
      toast("Mail sent.");
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    setButtonClicked(true);
    setVerified(false);
    const recaptchaThis = recaptchaRef.current;
    await fetch(`${process.env.NEXT_PUBLIC_MAIL_FETCH}`, {
      method: "POST",
      body: JSON.stringify(formData),
    })
      .then((data) => notify(data as unknown as boolean))
      .catch(() => notify())
      .finally(() => {
        reset();
        setButtonClicked(false);
        recaptchaThis.reset();
      });
  };

  return (
    <div className="relative mx-auto flex h-screen max-w-7xl flex-col items-center justify-start text-clip px-10 md:text-left">
      <h3 className="pageTitles">Contact</h3>
      <div className="flex h-[calc(100vh-100px)] flex-col items-center space-y-5 overflow-auto px-5 scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80 sm:space-y-10">
        <div className=" mt-10 flex flex-col space-y-3 sm:space-y-10">
          <h4 className="text-center text-2xl font-semibold sm:text-3xl md:text-4xl">
            I have got just what you need.{" "}
            <span className="underline decoration-[#f7ab0a]/50">Lets Talk</span>
            .
          </h4>
        </div>
        {/* <div className="flex items-center space-x-5 justify-center">
          <PhoneIcon
            width={28}
            height={28}
            className="text-[#F7AB0A] h-7 w-7 animate-pulse"
          />
          <p className="text-2xl">+9054174302095</p>
        </div> */}
        <div className="flex items-center justify-center space-x-5">
          <MapPinIcon
            width={28}
            height={28}
            className="h-7 w-7 animate-pulse text-[#F7AB0A]"
          />
          <p className="text-base sm:text-xl md:text-2xl">Turkey/Tekirdağ</p>
        </div>
        <div className="flex items-center justify-center space-x-5">
          <EnvelopeIcon
            width={28}
            height={28}
            className="h-7 w-7 animate-pulse text-[#F7AB0A]"
          />
          <p className="text-base sm:text-xl md:text-2xl">{pageInfo?.email}</p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto flex w-fit flex-col space-y-2 pb-10 "
        >
          <div className="flex space-x-2">
            <input
              {...register("name")}
              placeholder="Name"
              autoComplete="name"
              className="contactInput"
              onInput={handleInputChange}
              type="text"
            />
            <input
              {...register("email")}
              placeholder="Email"
              autoComplete="email"
              required
              className="contactInput"
              onInput={handleInputChange}
              type="email"
            />
          </div>
          <input
            {...register("subject")}
            placeholder="Subject"
            className="contactInput w-auto"
            onInput={handleInputChange}
            type="text"
          />
          <textarea
            {...register("message")}
            placeholder="Message"
            className="contactInput w-auto"
            onInput={handleInputChange}
            name="message"
            id="message"
          ></textarea>

          <ReCAPTCHA
            ref={recaptchaRef}
            className="captcha flex !w-full items-center justify-around overflow-hidden"
            sitekey="6Lfkal8kAAAAAEkJVAIeIkxEOrBRr2vNUzogdRUk"
            onChange={onChangeCaptcha}
            theme="dark"
            style={{ transform: "scale(0.95)" }}
          />

          <button
            type="submit"
            className="rounded-md bg-[#F7AB0A] py-5 px-10 text-lg font-bold text-black disabled:opacity-50"
            disabled={!verified}
          >
            {!buttonClicked ? "Submit" : <Loader color="dark:fill-[#e50914]" />}
          </button>
          <Toaster
            position="bottom-center"
            reverseOrder={false}
            toastOptions={{
              className: "",
              style: {
                border: "1px solid #F7AB0A",
                padding: "16px",
                color: "#F7AB0A",
                fontSize: "1.2em",
                fontWeight: "500",
                background: "rgb(36,36,36)",
              },
            }}
          />
        </form>
      </div>
    </div>
  );
};

export default ContactMe;
