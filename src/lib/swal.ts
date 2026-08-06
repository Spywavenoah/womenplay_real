import Swal from "sweetalert2";

export const showSuccessAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#db2777", // brand-pink
    customClass: {
      popup: "rounded-2xl font-sans",
      confirmButton: "rounded-xl px-5 py-2.5 font-bold text-xs uppercase tracking-wider",
    },
  });
};

export const showErrorAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#db2777",
    customClass: {
      popup: "rounded-2xl font-sans",
      confirmButton: "rounded-xl px-5 py-2.5 font-bold text-xs uppercase tracking-wider",
    },
  });
};

export const showInfoAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: "info",
    title,
    text,
    confirmButtonColor: "#0f172a",
    customClass: {
      popup: "rounded-2xl font-sans",
      confirmButton: "rounded-xl px-5 py-2.5 font-bold text-xs uppercase tracking-wider",
    },
  });
};

export const showConfirmDialog = async (
  title: string,
  text: string,
  confirmButtonText = "Yes, Proceed",
  cancelButtonText = "Cancel"
): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#db2777",
    cancelButtonColor: "#64748b",
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    customClass: {
      popup: "rounded-2xl font-sans",
      confirmButton: "rounded-xl px-5 py-2.5 font-bold text-xs uppercase tracking-wider",
      cancelButton: "rounded-xl px-5 py-2.5 font-bold text-xs uppercase tracking-wider",
    },
  });
  return result.isConfirmed;
};

export const showToast = (title: string, icon: "success" | "error" | "info" | "warning" = "success") => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
    customClass: {
      popup: "rounded-xl font-sans shadow-lg border border-slate-100",
    },
  });

  Toast.fire({
    icon,
    title,
  });
};
