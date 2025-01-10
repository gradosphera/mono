import { describe, expect, it } from "vitest";
import { createClient, Mutations } from "../src";
import { Queries } from "../src";

describe("should", () => {
  const client = createClient({
    base_url: "http://127.0.0.1:2998/v1/graphql",
    headers: {
      "server-secret": "SECRET",
    },
    chain_url: "http://127.0.0.1:8888",
    chain_id:
      "f50256680336ee6daaeee93915b945c1166b5dfc98977adcb717403ae225c559",
  });

  it("should fetch extensions", async () => {
    const { [Queries.Extensions.GetExtensions.name]: extensions }: Queries.Extensions.GetExtensions.IOutput = await client.Query(
      Queries.Extensions.GetExtensions.query,
      {
        variables: {
          data: { enabled: true },
        },
      }
    );
    expect(extensions).toBeDefined();
    expect(Array.isArray(extensions)).toBe(true);
  });

  it("should fetch branches", async () => {
    const filter: Queries.Branches.GetBranches.IInput = {
      data: {
        coopname: 'voskhod'
      }
    }
    

    const { [Queries.Branches.GetBranches.name]: branches } = await client.Query(Queries.Branches.GetBranches.query, {
      variables: filter,
    });
    expect(branches).toBeDefined();
    expect(Array.isArray(branches)).toBe(true);
  });
  

  it("should fetch payment methods", async () => {
    const { getPaymentMethods: paymentMethods }: Queries.PaymentMethods.GetPaymentMethods.IOutput = await client.Query(
      Queries.PaymentMethods.GetPaymentMethods.query
    );
    
    expect(paymentMethods).toBeDefined();
    expect(paymentMethods).toHaveProperty("items");
    expect(Array.isArray(paymentMethods.items)).toBe(true);
    expect(paymentMethods.items[0]).toHaveProperty("method_type", "bank_transfer");
    expect(paymentMethods.items[0]).toHaveProperty("username", "voskhod");
  });

  it("should fetch system info", async () => {
    const { [Queries.System.GetSystemInfo.name]: systemInfo } = await client.Query(
      Queries.System.GetSystemInfo.query
    );
    expect(systemInfo).toBeDefined();
    expect(systemInfo.blockchain_info).toBeDefined();
    expect(systemInfo.blockchain_info.chain_id).toBe(
      "f50256680336ee6daaeee93915b945c1166b5dfc98977adcb717403ae225c559"
    );
    expect(systemInfo.cooperator_account).toHaveProperty("username", "voskhod");
    expect(systemInfo.system_status).toBe("active");
  });

  it("should create a project of free decision", async () => {
    
    const dataDecision: Mutations.FreeDecisions.CreateProjectOfFreeDecision.IInput = {
      data: {
        question: "Решим?",
        decision: "Решение такое и сякое",
      }
    } 

    const { createProjectOfFreeDecision: project } = await client.Mutation(
      Mutations.FreeDecisions.CreateProjectOfFreeDecision.mutation,
      {
        variables: dataDecision,
      }
    );
    expect(project).toBeDefined();
    expect(project).toHaveProperty("id");
  });

  it("should generate a project of free decision document", async () => {
    
    const dataDecision: Mutations.FreeDecisions.CreateProjectOfFreeDecision.IInput = {
      data: {
        question: "Решим?",
        decision: "Решение такое и сякое",
      }
    };

    const { createProjectOfFreeDecision: project } = await client.Mutation(
      Mutations.FreeDecisions.CreateProjectOfFreeDecision.mutation,
      {
        variables: dataDecision,
      }
    );

    const dataDecisionDocument: Mutations.FreeDecisions.GenerateProjectOfFreeDecisionDocument.IInput = {
      data: {
        coopname: "voskhod",
        project_id: project.id,
        username: "ant",
      },
      options: {
        skip_save: true
      }
    };

    const { generateProjectOfFreeDecision: document } = await client.Mutation(
      Mutations.FreeDecisions.GenerateProjectOfFreeDecisionDocument.mutation,
      {
        variables: dataDecisionDocument,
      }
    );
    expect(document).toBeDefined();
    expect(document.meta).toHaveProperty("username", "ant");
    expect(document.meta).toHaveProperty("project_id", project.id);
  });
  
  
  
  // it("test", async () => {
    // const variables: Mutations.Participants.RegisterParticipant.IInput = {
    //   data: {
    //     username: username,
    //     privacy_agreement: signedPrivacyAgreement,
    //     signature_agreement: signedSignatureAgreement,
    //     statement: signedParticipantApplication,
    //     user_agreement: signedUserAgreement,
    //     wallet_agreement: signedWalletAgreement,
    //   }
    // }
    
  //   const { [Mutations.Account.RegisterAccount.name]: result } = await client.Mutation(
  //     Mutations.Account.RegisterAccount.mutation,
  //     {
  //       variables,
  //     }
  //   );
    
  // })
});
