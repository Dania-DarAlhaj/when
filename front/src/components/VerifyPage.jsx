import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function VerifyPage() {
  const navigate = useNavigate();

  //  to read token from URL
  useEffect(() => {
    supabase.auth.getSession();
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const role = sessionStorage.getItem("pendingRole");
          
          if (role === "user") navigate("/UserPage");
          else if (role === "owner") navigate("/OwnerPage");
        
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <h2>Confirm your signup</h2>
      <p>Please check your email and click the verification link to continue.</p>
    </div>
  );
}
