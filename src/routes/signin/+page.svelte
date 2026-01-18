<script>
	import knight from '$lib/assets/knight.png';

	let email = '';
	let password = '';

	let errorMessage = '';
	let isLoading = false;

	async function handleSignIn() {
		isLoading = true;
		errorMessage = '';

		try {
			const response = await fetch('${import.meta.env.VITE_API_URL}/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password }),
				credentials: 'include'
			});
			
		// try {
		// 	const response = await fetch('${import.meta.env.VITE_API_URL}/auth/login', {
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/json'
		// 		},
		// 		body: JSON.stringify({ email, password })
		// 	});

			const data = await response.json();

			if (data.success) {
				localStorage.setItem('userId', data.user.id);
				localStorage.setItem('user', JSON.stringify(data.user));

				localStorage.setItem('email', data.user.email);

				window.location.href = '/home';
			} else {
				errorMessage = data.message || 'Login failed';
			}
		} catch (error) {
			errorMessage = 'Failed to connect to server';
			console.error('Login error:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-[#EEE9E1] px-4 py-8">
	<div
		class="relative w-full max-w-2xl rounded-lg border-4 border-[#4F3117] bg-[#E8DCCD] p-6 shadow-lg sm:p-8 md:p-12"
	>
		<!-- Sign In Title -->
		<h1 class="mb-6 text-center font-['IM_Fell_Great_Primer_SC'] text-3xl text-[#4F3117] sm:mb-8 sm:text-4xl">
			Sign In
		</h1>

		<div class="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
			<!-- Form Section -->
			<form on:submit|preventDefault={handleSignIn} class="w-full flex-1 space-y-4 sm:space-y-6">
				{#if errorMessage}
					<div class="mb-4 rounded bg-red-100 p-3 text-sm text-red-700 sm:text-base">
						{errorMessage}
					</div>
				{/if}
				<!-- Email Field -->
				<div>
					<label
						for="email"
						class="mb-2 block font-['IM_Fell_Great_Primer_SC'] text-lg text-[#4F3117] sm:text-xl"
					>
						Email
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						placeholder="Enter email address..."
						class="w-full rounded border border-[#D4C5B0] bg-white px-3 py-2 text-sm text-[#4F3117] placeholder-[#A89078] focus:border-[#4F3117] focus:outline-none sm:text-base"
						required
					/>
				</div>

				<!-- Password Field -->
				<div>
					<label
						for="password"
						class="mb-2 block font-['IM_Fell_Great_Primer_SC'] text-lg text-[#4F3117] sm:text-xl"
					>
						Password
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						placeholder="Enter password..."
						class="w-full rounded border border-[#D4C5B0] bg-white px-3 py-2 text-sm text-[#4F3117] placeholder-[#A89078] focus:border-[#4F3117] focus:outline-none sm:text-base"
						required
					/>
					<a
						href="/forgot-password"
						class="mt-1 block font-['IM_Fell_Great_Primer_SC'] text-xs text-[#7A5C3E] underline hover:text-[#382a1d]"
					>
						FORGOT YOUR PASSWORD?
					</a>
				</div>

				<!-- Sign In Button -->
				<button
					type="submit"
					disabled={isLoading}
					class="w-full rounded bg-[#4F3117] py-2.5 font-['IM_Fell_Great_Primer_SC'] text-sm font-medium text-[#EEE9E1] transition hover:bg-[#3E2612] disabled:opacity-50 sm:text-base"
				>
					{isLoading ? 'SIGNING IN...' : 'SIGN IN'}
				</button>
			</form>

			<!-- Knight Image -->
			<div class="shrink-0">
				<div class="flex h-32 w-32 items-center justify-center rounded-full bg-[#D2BCA1] sm:h-40 sm:w-40 md:h-48 md:w-48">
					<img src={knight} alt="Knight character" class="h-24 w-auto sm:h-32 md:h-40" />
				</div>
			</div>
		</div>
	</div>
</div>