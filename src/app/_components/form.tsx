"use client";
import { createTanzaku } from "@/api/client";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";

type FormData = {
  name: string;
  message: string;
};

export const Form: React.FC = () => {
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    console.log(data);
    const res = await createTanzaku({
      content: data.message,
      userName: data.name,
    });
    console.log(res);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "center",
      })}
    >
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          width: "100%",
        })}
      >
        <label
          htmlFor="name"
          className={css({ fontSize: "16px", fontWeight: "bold" })}
        >
          名前
        </label>
        <input
          {...register("name")}
          className={css({ border: "1px solid #ccc", padding: "8px" })}
        />
      </div>
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          width: "100%",
        })}
      >
        <label
          htmlFor="message"
          className={css({ fontSize: "16px", fontWeight: "bold" })}
        >
          メッセージ
        </label>
        <input
          {...register("message")}
          className={css({ border: "1px solid #ccc", padding: "8px" })}
        />
      </div>
      <button
        type="submit"
        className={css({
          background: "#000",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
          _hover: {
            background: "#333",
          },
          marginTop: "10px",
        })}
      >
        短冊をかける
      </button>
    </form>
  );
};
