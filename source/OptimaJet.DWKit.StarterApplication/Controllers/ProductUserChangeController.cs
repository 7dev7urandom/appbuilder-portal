﻿
using System.Threading.Tasks;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Mvc;
using OptimaJet.DWKit.StarterApplication.Models;
using OptimaJet.DWKit.StarterApplication.Services;

namespace OptimaJet.DWKit.StarterApplication.Controllers
{
    public class ProductUserChangeController : BaseController<ProductUserChange>
    {
        public ProductUserChangeController(
            IJsonApiContext jsonApiContext,
            IResourceService<ProductUserChange> resourceService,
            ICurrentUserContext currentUserContext,
            OrganizationService organizationService,
            UserService userService)
            : base(jsonApiContext, resourceService, currentUserContext, organizationService, userService)

        {
        }
    }
}
