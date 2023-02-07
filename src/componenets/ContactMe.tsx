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
  const recaptchaRef = React.createRef<any>();
  const { register, handleSubmit, reset } = useForm<Inputs>();
  const [verified, setVerified] = useState(false);
  const onChangeCaptcha = (value: any) => {
    setVerified(true);
  };
  const [buttonClicked, setButtonClicked] = useState(false);

  const notify = (mailSent: boolean) => {
    if (!mailSent) toast("Failed to send Mail.");
    else {
      toast("Mail sent.");
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    setButtonClicked(true);
    const recaptchaThis = recaptchaRef.current;
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sendMail`, {
      method: "POST",
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => notify(data!))
      .finally(() => {
        setVerified(false);
        reset();
        setButtonClicked(false);
        recaptchaThis.reset();
      });
  };

  return (
    <div className="h-screen flex relative flex-col text-clip md:text-left max-w-7xl px-10 justify-start mx-auto items-center">
      <h3 className="pageTitles">Contact</h3>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] space-y-5 sm:space-y-10 overflow-auto px-5 scrollbar-thin scrollbar-track-gray-400/20 scrollbar-thumb-[#F7AB0A]/80">
        <div className=" mt-10 flex flex-col space-y-3 sm:space-y-10">
          <h4 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center">
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
        <div className="flex items-center space-x-5 justify-center">
          <MapPinIcon
            width={28}
            height={28}
            className="text-[#F7AB0A] h-7 w-7 animate-pulse"
          />
          <p className="text-base sm:text-xl md:text-2xl">Turkey/Tekirdağ</p>
        </div>
        <div className="flex items-center space-x-5 justify-center">
          <EnvelopeIcon
            width={28}
            height={28}
            className="text-[#F7AB0A] h-7 w-7 animate-pulse"
          />
          <p className="text-base sm:text-xl md:text-2xl">{pageInfo?.email}</p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col space-y-2 w-fit mx-auto pb-10 "
        >
          <div className="flex space-x-2">
            <input
              {...register("name")}
              placeholder="Name"
              className="contactInput"
              type="text"
            />
            <input
              {...register("email")}
              placeholder="Email"
              required
              className="contactInput"
              type="email"
            />
          </div>
          <input
            {...register("subject")}
            placeholder="Subject"
            className="contactInput w-auto"
            type="text"
          />
          <textarea
            {...register("message")}
            placeholder="Message"
            className="contactInput w-auto"
            name="message"
            id="message"
          ></textarea>

          <ReCAPTCHA
            ref={recaptchaRef}
            className="!w-full flex items-center justify-around overflow-hidden captcha"
            sitekey="6Lfkal8kAAAAAEkJVAIeIkxEOrBRr2vNUzogdRUk"
            onChange={onChangeCaptcha}
            theme="dark"
            style={{ transform: "scale(0.95)" }}
          />

          <button
            type="submit"
            className="bg-[#F7AB0A] py-5 px-10 rounded-md text-black font-bold text-lg disabled:opacity-50"
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
