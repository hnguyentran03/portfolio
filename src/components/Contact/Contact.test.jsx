import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import emailjs from "@emailjs/browser";

import { Contact } from "./Contact";
import styles from "./Contact.module.css";

vi.mock("@emailjs/browser", () => ({
  default: { sendForm: vi.fn() },
}));

const fillAndSubmit = () => {
  fireEvent.change(screen.getByPlaceholderText("First Name"), { target: { value: "Ada" } });
  fireEvent.change(screen.getByPlaceholderText("Last Name"), { target: { value: "Lovelace" } });
  fireEvent.change(screen.getByPlaceholderText("Email Address"), { target: { value: "ada@example.com" } });
  fireEvent.change(screen.getByPlaceholderText("Subject"), { target: { value: "Hello" } });
  fireEvent.change(screen.getByPlaceholderText("Message"), { target: { value: "Hi Ben" } });
  fireEvent.click(screen.getByRole("button", { name: "Send" }));
};

describe("Contact", () => {
  beforeEach(() => {
    emailjs.sendForm.mockReset();
  });

  it("renders inputs whose names match the EmailJS template variables", () => {
    render(<Contact />);
    expect(screen.getByPlaceholderText("First Name")).toHaveAttribute("name", "first_name");
    expect(screen.getByPlaceholderText("Last Name")).toHaveAttribute("name", "last_name");
    expect(screen.getByPlaceholderText("Email Address")).toHaveAttribute("name", "user_email");
    expect(screen.getByPlaceholderText("Email Address")).toHaveAttribute("type", "email");
    expect(screen.getByPlaceholderText("Subject")).toHaveAttribute("name", "subject");
    expect(screen.getByPlaceholderText("Message")).toHaveAttribute("name", "message");
  });

  it("sends the form element with the configured service, template, and public key", async () => {
    emailjs.sendForm.mockResolvedValue({ status: 200 });
    const { container } = render(<Contact />);
    fillAndSubmit();
    await waitFor(() => expect(emailjs.sendForm).toHaveBeenCalledTimes(1));
    const [service, template, formEl, options] = emailjs.sendForm.mock.calls[0];
    expect(service).toBe("service_2z5tgpg");
    expect(template).toBe("template_cbyifdk");
    expect(formEl).toBe(container.querySelector("form"));
    expect(options).toEqual({ publicKey: "EXcMNC3QWevzm-VIU" });
  });

  it("shows Sending... while in flight, then a success message", async () => {
    let resolveSend;
    emailjs.sendForm.mockReturnValue(new Promise((resolve) => { resolveSend = resolve; }));
    render(<Contact />);
    fillAndSubmit();
    expect(screen.getByRole("button", { name: "Sending..." })).toBeInTheDocument();

    resolveSend({ status: 200 });
    const status = await screen.findByText("Message sent successfully!");
    expect(status).toHaveClass(styles.success);
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("shows an error message when sending fails", async () => {
    emailjs.sendForm.mockRejectedValue(new Error("network"));
    render(<Contact />);
    fillAndSubmit();
    const status = await screen.findByText("Something went wrong, please try again later.");
    expect(status).toHaveClass(styles.danger);
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("replaces an earlier error with a later success", async () => {
    emailjs.sendForm.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce({ status: 200 });
    render(<Contact />);
    fillAndSubmit();
    await screen.findByText("Something went wrong, please try again later.");
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await screen.findByText("Message sent successfully!");
    expect(screen.queryByText("Something went wrong, please try again later.")).not.toBeInTheDocument();
  });

  it("has the section id the navbar scrolls to", () => {
    const { container } = render(<Contact />);
    expect(container.querySelector("section#contact")).toBeInTheDocument();
  });
});
