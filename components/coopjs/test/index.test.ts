import { describe, expect, it } from "vitest";
import { createClient } from "../src";
import { Queries, Mutations } from "../src";
import { ModelTypes } from "../dist";
import { Selector } from "../src/zeus";

describe("should", () => {
  const client = createClient({
    baseUrl: "http://127.0.0.1:2998/v1/graphql",
    headers: {
      "server-secret": "SECRET",
    },
    blockchainUrl: "http://127.0.0.1:8888",
    chainId:
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
    const filter: ModelTypes["GetBranchesInput"] = {
      coopname: "voskhod",
    };

    const { [Queries.Branches.GetBranches.name]: branches } = await client.Query(Queries.Branches.GetBranches.query, {
      variables: {
        data: filter,
      },
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
    const dataDecision: Mutations.Decisions.CreateProjectOfFreeDecision.IInput = {
      header: "Срочное решение! 1",
      question: "Решим?",
      decision: "Решение такое и сякое",
    };

    const { createProjectOfFreeDecision: project } = await client.Mutation(
      Mutations.Decisions.CreateProjectOfFreeDecision.mutation,
      {
        variables: {
          data: dataDecision,
        },
      }
    );
    expect(project).toBeDefined();
    expect(project).toHaveProperty("id");
    expect(project.header).toBe("Срочное решение! 1");
  });

  it("should generate a project of free decision document", async () => {
    const dataDecision: Mutations.Decisions.CreateProjectOfFreeDecision.IInput = {
      header: "Срочное решение! 1",
      question: "Решим?",
      decision: "Решение такое и сякое",
    };

    const { createProjectOfFreeDecision: project } = await client.Mutation(
      Mutations.Decisions.CreateProjectOfFreeDecision.mutation,
      {
        variables: {
          data: dataDecision,
        },
      }
    );

    const dataDecisionDocument: Mutations.Decisions.GenerateProjectOfFreeDecisionDocument.IInput = {
      coopname: "voskhod",
      project_id: project.id,
      username: "ant",
    };

    const { generateProjectOfFreeDecision: document } = await client.Mutation(
      Mutations.Decisions.GenerateProjectOfFreeDecisionDocument.mutation,
      {
        variables: {
          data: dataDecisionDocument,
        },
      }
    );
    expect(document).toBeDefined();
    expect(document.full_title).toContain("Срочное решение! 1");
    expect(document.meta).toHaveProperty("username", "ant");
    expect(document.meta).toHaveProperty("project_id", project.id);
  });
});
