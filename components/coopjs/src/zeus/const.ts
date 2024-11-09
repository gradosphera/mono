/* eslint-disable */

export const AllTypesProps: Record<string,any> = {
	DateTime: `scalar.DateTime` as const,
	ExtensionInput:{
		config:"JSON",
		created_at:"DateTime",
		updated_at:"DateTime"
	},
	JSON: `scalar.JSON` as const,
	Mutation:{
		installExtension:{
			appData:"ExtensionInput"
		}
	}
}

export const ReturnTypes: Record<string,any> = {
	DateTime: `scalar.DateTime` as const,
	Extension:{
		config:"JSON",
		created_at:"DateTime",
		enabled:"Boolean",
		name:"String",
		updated_at:"DateTime"
	},
	JSON: `scalar.JSON` as const,
	Mutation:{
		installExtension:"Extension"
	},
	Query:{
		getExtensions:"Extension",
		helloWorld:"String"
	}
}

export const Ops = {
query: "Query" as const,
	mutation: "Mutation" as const
}