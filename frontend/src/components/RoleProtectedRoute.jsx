import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function RoleProtectedRoute({
  allowedRole,
  children,
}) {
  const [status, setStatus] = useState("loading");
  const [redirectTo, setRedirectTo] = useState("/login");

  useEffect(() => {
    let mounted = true;

    const verifyRole = async () => {
      try {
        // =========================================
        // GET CURRENT SESSION
        // =========================================

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        // =========================================
        // NOT LOGGED IN
        // =========================================

        if (!session) {
          if (mounted) {
            setRedirectTo("/login");
            setStatus("redirect");
          }

          return;
        }

        // =========================================
        // GET USER ROLE
        // =========================================

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        const role = profile?.role;

        // =========================================
        // CHECK SELLER ACCESS
        // =========================================

        const sellerAllowed =
          allowedRole === "seller" &&
          (role === "seller" || role === "admin");

        // =========================================
        // CHECK CUSTOMER ACCESS
        // =========================================

        const customerAllowed =
          allowedRole === "customer" &&
          role === "customer";

        // =========================================
        // ACCESS GRANTED
        // =========================================

        if (
          sellerAllowed ||
          customerAllowed
        ) {
          if (mounted) {
            setStatus("allowed");
          }

          return;
        }

        // =========================================
        // WRONG ROLE
        // =========================================

        if (mounted) {
          if (
            role === "seller" ||
            role === "admin"
          ) {
            // Seller/Admin belongs to seller area
            setRedirectTo("/seller/account");
          } else if (
            role === "customer"
          ) {
            // Customer belongs to customer area
            setRedirectTo("/account");
          } else {
            // Unknown role
            setRedirectTo("/login");
          }

          setStatus("redirect");
        }
      } catch (error) {
        console.error(
          "Role verification error:",
          error
        );

        if (mounted) {
          setRedirectTo("/login");
          setStatus("redirect");
        }
      }
    };

    verifyRole();

    return () => {
      mounted = false;
    };
  }, [allowedRole]);

  // =========================================
  // REDIRECT
  // =========================================

  if (status === "redirect") {
    return (
      <Navigate
        to={redirectTo}
        replace
      />
    );
  }

  // =========================================
  // LOADING
  // =========================================

  if (status === "loading") {
    return (
      <main
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          padding: "40px 20px",
        }}
      >
        <p>
          Checking account access...
        </p>
      </main>
    );
  }

  // =========================================
  // ALLOWED
  // =========================================

  return children;
}

export default RoleProtectedRoute;